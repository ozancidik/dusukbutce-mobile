/**
 * Auto-Apply Engine — Applies low-risk suggestions automatically
 * High-risk suggestions require manual approval
 */

import { Suggestion, getAutoApplicableSuggestions } from './suggestions';

export interface ApplyResult {
  suggestionId: string;
  status: 'applied' | 'failed' | 'skipped';
  error?: string;
  filesModified?: string[];
  appliedAt: Date;
}

export interface AutoApplyConfig {
  dryRun?: boolean; // Preview without actually applying
  maxConcurrent?: number; // How many fixes to apply in parallel
  stopOnFirstFailure?: boolean; // Stop if any fix fails
}

/**
 * Auto-apply all low-risk suggestions
 */
export async function autoApplySuggestions(
  suggestions: Suggestion[],
  config: AutoApplyConfig = {}
): Promise<ApplyResult[]> {
  const results: ApplyResult[] = [];
  const applicableSuggestions = getAutoApplicableSuggestions(suggestions);

  if (applicableSuggestions.length === 0) {
    console.log('✅ No auto-applicable suggestions');
    return results;
  }

  console.log(`🤖 Auto-applying ${applicableSuggestions.length} low-risk fixes...`);

  const maxConcurrent = config.maxConcurrent || 5;
  const chunks = chunkArray(applicableSuggestions, maxConcurrent);

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((s) => applySingleSuggestion(s, config))
    );
    results.push(...chunkResults);

    if (config.stopOnFirstFailure && chunkResults.some((r) => r.status === 'failed')) {
      console.error('❌ Stopping: first failure encountered');
      break;
    }
  }

  return results;
}

/**
 * Apply a single suggestion
 */
async function applySingleSuggestion(
  suggestion: Suggestion,
  config: AutoApplyConfig
): Promise<ApplyResult> {
  const result: ApplyResult = {
    suggestionId: suggestion.id,
    status: 'skipped',
    appliedAt: new Date(),
  };

  try {
    if (config.dryRun) {
      console.log(`[DRY-RUN] Would apply: ${suggestion.title}`);
      result.status = 'applied'; // Count as success in dry-run
      return result;
    }

    // Apply based on suggestion type
    switch (suggestion.type) {
      case 'format-fix':
        result.filesModified = await applyFormatFix(suggestion);
        break;
      case 'lint-fix':
        result.filesModified = await applyLintFix(suggestion);
        break;
      case 'import-cleanup':
        result.filesModified = await applyImportCleanup(suggestion);
        break;
      case 'type-fix':
        result.filesModified = await applyTypeFix(suggestion);
        break;
      default:
        result.error = `Cannot auto-apply ${suggestion.type}`;
        return result;
    }

    result.status = 'applied';
    console.log(`✅ Applied: ${suggestion.title}`);
  } catch (error) {
    result.status = 'failed';
    result.error = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to apply ${suggestion.title}: ${result.error}`);
  }

  return result;
}

/**
 * Apply format fixes (prettier, spacing, etc.)
 * Mock implementation — would use actual file system in production
 */
async function applyFormatFix(suggestion: Suggestion): Promise<string[]> {
  // In production: run prettier on suggestion.files
  console.log(`  Running prettier on ${suggestion.files.length} files...`);
  return suggestion.files;
}

/**
 * Apply eslint auto-fixes
 * Mock implementation — would run eslint --fix
 */
async function applyLintFix(suggestion: Suggestion): Promise<string[]> {
  // In production: run eslint --fix on suggestion.files
  console.log(`  Running eslint --fix on ${suggestion.files.length} files...`);
  return suggestion.files;
}

/**
 * Remove unused imports
 * Mock implementation — would actually parse & modify files
 */
async function applyImportCleanup(suggestion: Suggestion): Promise<string[]> {
  // In production: parse imports, remove unused ones
  console.log(`  Cleaning imports from ${suggestion.files.length} files...`);
  return suggestion.files;
}

/**
 * Apply type annotations
 * Mock implementation
 */
async function applyTypeFix(suggestion: Suggestion): Promise<string[]> {
  // In production: parse and apply type fixes (Array<T> → T[], etc.)
  console.log(`  Applying type fixes to ${suggestion.files.length} files...`);
  return suggestion.files;
}

/**
 * Helper: chunk array
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Generate commit message for auto-applied fixes
 */
export function generateAutoFixCommitMessage(results: ApplyResult[]): string {
  const applied = results.filter((r) => r.status === 'applied');
  const failed = results.filter((r) => r.status === 'failed');

  let message = 'chore: auto-apply low-risk agent suggestions\n\n';
  message += `Applied ${applied.length} fixes:\n`;

  if (failed.length > 0) {
    message += `\nFailed ${failed.length} fixes (manual review needed):\n`;
    failed.forEach((f) => {
      message += `- ${f.suggestionId}: ${f.error}\n`;
    });
  }

  message += '\nGenerated by Faz 4a Suggestion Engine (ECC)\n';
  return message;
}

/**
 * Report auto-apply results
 */
export function reportAutoApplyResults(results: ApplyResult[]): string {
  const applied = results.filter((r) => r.status === 'applied').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return `
## Auto-Apply Results

| Status | Count |
|--------|-------|
| ✅ Applied | ${applied} |
| ❌ Failed | ${failed} |
| ⊘ Skipped | ${skipped} |

${applied > 0 ? `### ✅ Applied Fixes\n${results.filter((r) => r.status === 'applied').map((r) => `- ${r.suggestionId}`).join('\n')}\n` : ''}

${failed > 0 ? `### ❌ Failed Fixes\n${results.filter((r) => r.status === 'failed').map((r) => `- ${r.suggestionId}: ${r.error}`).join('\n')}\n` : ''}
`;
}
