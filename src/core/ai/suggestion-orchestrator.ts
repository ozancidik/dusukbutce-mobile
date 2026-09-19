/**
 * Suggestion Orchestrator — Coordinates suggestions across all agents
 * Merges, deduplicates, prioritizes, and routes for auto-apply or manual review
 */

import {
  Suggestion,
  filterSuggestions,
  getAutoApplicableSuggestions,
  getManualSuggestions,
  RiskLevel,
  ActionType,
} from './suggestions';
import { autoApplySuggestions, ApplyResult, reportAutoApplyResults } from './auto-apply';

export interface OrchestrationConfig {
  autoApplyLowRisk?: boolean; // Default: true
  autoApplyMediumRisk?: boolean; // Default: false
  maxSuggestionsPerFile?: number; // Default: 10
  deduplicateSimilar?: boolean; // Default: true
  dryRun?: boolean;
}

export interface OrchestrationResult {
  totalSuggestions: number;
  autoApplied: ApplyResult[];
  pendingApproval: Suggestion[];
  duplicatesRemoved: number;
  files: {
    autoApply: string[];
    manualReview: string[];
    highRisk: string[];
  };
  report: string;
}

/**
 * Main orchestration function
 * Called after all agents have generated suggestions
 */
export async function orchestrateSuggestions(
  suggestionsFromAllAgents: Suggestion[],
  config: OrchestrationConfig = {}
): Promise<OrchestrationResult> {
  const cfg = {
    autoApplyLowRisk: true,
    autoApplyMediumRisk: false,
    maxSuggestionsPerFile: 10,
    deduplicateSimilar: true,
    dryRun: false,
    ...config,
  };

  console.log(`\n🎛️ Orchestrating ${suggestionsFromAllAgents.length} suggestions...\n`);

  // Step 1: Deduplicate similar suggestions
  let suggestions = suggestionsFromAllAgents;
  const duplicatesRemoved = suggestions.length;
  if (cfg.deduplicateSimilar) {
    suggestions = deduplicateSuggestions(suggestions);
  }
  const duplicatesRemovedCount = duplicatesRemoved - suggestions.length;

  // Step 2: Limit suggestions per file
  suggestions = limitSuggestionsPerFile(suggestions, cfg.maxSuggestionsPerFile);

  // Step 3: Separate by action type
  const autoApplicable = filterSuggestions(suggestions, { actionType: 'auto_apply' });
  const manualReview = filterSuggestions(suggestions, { actionType: 'manual_approval' });
  const highRisk = filterSuggestions(suggestions, { actionType: 'manual_only' });

  // Step 4: Auto-apply low-risk if enabled
  let autoAppliedResults: ApplyResult[] = [];
  if (cfg.autoApplyLowRisk && autoApplicable.length > 0) {
    console.log(`\n🤖 Auto-applying ${autoApplicable.length} low-risk fixes...\n`);
    autoAppliedResults = await autoApplySuggestions(autoApplicable, { dryRun: cfg.dryRun });
  }

  // Step 5: Prepare manual review queue
  const pendingApproval = [...manualReview, ...highRisk].sort((a, b) => b.confidence - a.confidence);

  // Step 6: Collect affected files
  const files = {
    autoApply: dedupFiles(autoApplicable.flatMap((s) => s.files)),
    manualReview: dedupFiles(manualReview.flatMap((s) => s.files)),
    highRisk: dedupFiles(highRisk.flatMap((s) => s.files)),
  };

  // Step 7: Generate report
  const report = generateOrchestrationReport({
    total: suggestions.length,
    autoApply: autoApplicable.length,
    manualReview: manualReview.length,
    highRisk: highRisk.length,
    autoAppliedResults,
    pendingApproval,
    files,
    duplicatesRemoved: duplicatesRemovedCount,
  });

  return {
    totalSuggestions: suggestions.length,
    autoApplied: autoAppliedResults,
    pendingApproval,
    duplicatesRemoved: duplicatesRemovedCount,
    files,
    report,
  };
}

/**
 * Deduplicate similar suggestions
 * Keeps highest-confidence version
 */
function deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
  const map = new Map<string, Suggestion>();

  for (const s of suggestions) {
    const key = `${s.type}:${s.files.join(',')}`;
    const existing = map.get(key);

    if (!existing || s.confidence > existing.confidence) {
      map.set(key, s);
    }
  }

  return Array.from(map.values());
}

/**
 * Limit suggestions per file to avoid overwhelming
 */
function limitSuggestionsPerFile(
  suggestions: Suggestion[],
  maxPerFile: number
): Suggestion[] {
  const fileMap = new Map<string, Suggestion[]>();

  for (const s of suggestions) {
    for (const file of s.files) {
      if (!fileMap.has(file)) {
        fileMap.set(file, []);
      }
      fileMap.get(file)!.push(s);
    }
  }

  const result: Suggestion[] = [];
  for (const [, subs] of fileMap) {
    // Sort by confidence and take top N
    const topSubs = subs.sort((a, b) => b.confidence - a.confidence).slice(0, maxPerFile);
    result.push(...topSubs);
  }

  return result;
}

/**
 * Deduplicate file list
 */
function dedupFiles(files: string[]): string[] {
  return Array.from(new Set(files)).sort();
}

/**
 * Generate orchestration report
 */
function generateOrchestrationReport(params: {
  total: number;
  autoApply: number;
  manualReview: number;
  highRisk: number;
  autoAppliedResults: ApplyResult[];
  pendingApproval: Suggestion[];
  files: { autoApply: string[]; manualReview: string[]; highRisk: string[] };
  duplicatesRemoved: number;
}): string {
  const {
    total,
    autoApply,
    manualReview,
    highRisk,
    autoAppliedResults,
    pendingApproval,
    files,
    duplicatesRemoved,
  } = params;

  const autoAppliedCount = autoAppliedResults.filter((r) => r.status === 'applied').length;
  const autoFailedCount = autoAppliedResults.filter((r) => r.status === 'failed').length;

  return `
# 🎛️ Orchestration Report

## Summary

| Metric | Count |
|--------|-------|
| **Total Suggestions** | ${total} |
| **Duplicates Removed** | ${duplicatesRemoved} |
| **Auto-Apply (Low Risk)** | ${autoApply} |
| **Manual Review (Medium)** | ${manualReview} |
| **Manual Only (High Risk)** | ${highRisk} |

## Auto-Apply Results

| Status | Count |
|--------|-------|
| ✅ Applied | ${autoAppliedCount} |
| ❌ Failed | ${autoFailedCount} |

${autoAppliedCount > 0 ? `### ✅ Successfully Applied\n${autoAppliedResults
    .filter((r) => r.status === 'applied')
    .map((r) => `- \`${r.filesModified?.join(', ') || 'unknown'}\``)
    .join('\n')}\n` : ''}

${autoFailedCount > 0 ? `### ❌ Failed to Apply\n${autoAppliedResults
    .filter((r) => r.status === 'failed')
    .map((r) => `- ${r.error}`)
    .join('\n')}\n` : ''}

## Pending Approval

${
  pendingApproval.length > 0
    ? `**${pendingApproval.length} suggestions awaiting review:**\n\n` +
      pendingApproval
        .slice(0, 10)
        .map(
          (s) =>
            `- **${s.title}** (${s.severity.toUpperCase()}, ${(s.confidence * 100).toFixed(0)}% confidence)\n` +
            `  - Files: ${s.files.join(', ')}\n` +
            `  - Agent: ${s.agentSource}`
        )
        .join('\n')
    : '✅ No suggestions pending approval'
}

${pendingApproval.length > 10 ? `... and ${pendingApproval.length - 10} more\n` : ''}

## Files Affected

### 🤖 Auto-Applied (${files.autoApply.length})
\`\`\`
${files.autoApply.slice(0, 5).join('\n')}
${files.autoApply.length > 5 ? `... and ${files.autoApply.length - 5} more` : ''}
\`\`\`

### 👤 Needs Review (${files.manualReview.length})
\`\`\`
${files.manualReview.slice(0, 5).join('\n')}
${files.manualReview.length > 5 ? `... and ${files.manualReview.length - 5} more` : ''}
\`\`\`

### 🔴 High Risk (${files.highRisk.length})
\`\`\`
${files.highRisk.slice(0, 5).join('\n')}
${files.highRisk.length > 5 ? `... and ${files.highRisk.length - 5} more` : ''}
\`\`\`

## Next Steps

${
  autoFailedCount > 0
    ? '1. ❌ Review and fix failed auto-applies\n2. 👤 Approve/reject manual suggestions\n3. 🚀 Run tests\n'
    : pendingApproval.length > 0
      ? '1. 👤 Review and approve suggestions\n2. 🚀 Run tests\n3. ✅ Merge to main\n'
      : '1. ✅ All fixes applied and reviewed\n2. 🚀 Run tests\n3. ✅ Merge to main\n'
}

---
*Generated by Faz 4a Suggestion Orchestrator*
`;
}

/**
 * Batch orchestration for multiple commits
 */
export async function batchOrchestrate(
  suggestionsBatch: Suggestion[][],
  config?: OrchestrationConfig
): Promise<OrchestrationResult[]> {
  const results: OrchestrationResult[] = [];

  for (const suggestions of suggestionsBatch) {
    const result = await orchestrateSuggestions(suggestions, config);
    results.push(result);
  }

  return results;
}
