/**
 * ECC Integration Layer — Bridges ECC agents to Suggestion Engine
 * Parses agent reports and generates suggestions automatically
 */

import {
  Suggestion,
  AgentSuggestions,
  generateSuggestion,
  SuggestionType,
  RiskLevel,
} from './suggestions';
import {
  orchestrateSuggestions,
  OrchestrationConfig,
  OrchestrationResult,
} from './suggestion-orchestrator';
import { autoApplySuggestions, ApplyResult } from './auto-apply';

export interface AgentReport {
  agentName: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'partial';
  duration: number; // milliseconds
  files?: string[];
  issues?: Array<{
    type: string;
    severity: string;
    message: string;
    file: string;
    line?: number;
    suggestion?: string;
  }>;
  tests?: Array<{
    name: string;
    passed: boolean;
    error?: string;
    file?: string;
  }>;
  vulnerabilities?: Array<{
    package: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix: string;
  }>;
  metrics?: Record<string, any>;
}

export interface ECCIntegrationConfig extends OrchestrationConfig {
  parseReports: boolean; // Auto-parse agent reports
  autoCommit: boolean; // Auto-commit applied fixes
  linkToGit: boolean; // Link suggestions to git history
}

/**
 * Parse ECC agent report and generate suggestions
 */
export function parseAgentReport(report: AgentReport): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Route by agent type
  switch (report.agentName) {
    case 'code-quality':
      if (report.issues) {
        suggestions.push(
          ...AgentSuggestions.fromCodeQuality({
            issues: report.issues.map((i) => ({
              type: i.type,
              file: i.file,
              line: i.line || 0,
              message: i.message,
            })),
          })
        );
      }
      break;

    case 'mobile-qa':
      if (report.tests) {
        const failures = report.tests
          .filter((t) => !t.passed)
          .map((t) => ({
            test: t.name,
            error: t.error || 'Test failed',
            file: t.file || 'unknown',
            suggestion: undefined,
          }));
        if (failures.length > 0) {
          suggestions.push(...AgentSuggestions.fromMobileQA({ failures }));
        }
      }
      break;

    case 'security-scanner':
      if (report.vulnerabilities) {
        suggestions.push(
          ...AgentSuggestions.fromSecurityScanner({
            vulnerabilities: report.vulnerabilities,
          })
        );
      }
      break;

    case 'backend-qa':
      if (report.tests) {
        const failures = report.tests
          .filter((t) => !t.passed)
          .map((t) => ({
            test: t.name,
            error: t.error || 'API test failed',
            file: t.file || 'api',
          }));
        if (failures.length > 0) {
          suggestions.push(...AgentSuggestions.fromMobileQA({ failures }));
        }
      }
      break;

    case 'build-optimizer':
      if (report.issues) {
        suggestions.push(
          ...AgentSuggestions.fromCodeQuality({
            issues: report.issues.map((i) => ({
              type: 'performance',
              file: i.file,
              line: 0,
              message: i.message,
            })),
          })
        );
      }
      break;

    // Add more agent types as needed
  }

  return suggestions;
}

/**
 * Process multiple agent reports in batch
 */
export async function processAgentReports(
  reports: AgentReport[],
  config: ECCIntegrationConfig = {}
): Promise<{
  suggestions: Suggestion[];
  orchestrationResult: OrchestrationResult;
  autoApplied: ApplyResult[];
}> {
  console.log(`\n📋 Processing ${reports.length} agent reports...\n`);

  // Step 1: Parse all reports into suggestions
  const allSuggestions: Suggestion[] = [];
  for (const report of reports) {
    const suggestions = parseAgentReport(report);
    allSuggestions.push(...suggestions);
    console.log(`  ✓ ${report.agentName}: ${suggestions.length} suggestions`);
  }

  console.log(`\n📊 Total suggestions: ${allSuggestions.length}\n`);

  // Step 2: Orchestrate (dedup, route, etc.)
  const orchestrationResult = await orchestrateSuggestions(allSuggestions, config);

  // Step 3: Auto-apply low-risk if enabled
  let autoApplied: ApplyResult[] = [];
  if (config.autoApplyLowRisk && orchestrationResult.autoApplied.length > 0) {
    autoApplied = orchestrationResult.autoApplied;
  }

  return {
    suggestions: allSuggestions,
    orchestrationResult,
    autoApplied,
  };
}

/**
 * Generate ECC hook output (for .ecc/post-commit script)
 */
export function generateECCHookOutput(params: {
  orchestrationResult: OrchestrationResult;
  autoApplied: ApplyResult[];
  branchName: string;
  commitHash: string;
}): string {
  const { orchestrationResult, autoApplied, branchName, commitHash } = params;

  const appliedCount = autoApplied.filter((r) => r.status === 'applied').length;
  const failedCount = autoApplied.filter((r) => r.status === 'failed').length;

  return `
# ECC Suggestion Engine Report

**Branch:** ${branchName}
**Commit:** ${commitHash}
**Time:** ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Suggestions | ${orchestrationResult.totalSuggestions} |
| Auto-Applicable | ${orchestrationResult.autoApplied.length} |
| Applied | ${appliedCount} |
| Failed | ${failedCount} |
| Pending Approval | ${orchestrationResult.pendingApproval.length} |

## Auto-Applied Fixes

${
  appliedCount > 0
    ? `✅ ${appliedCount} fixes applied automatically`
    : '✅ No auto-applicable fixes'
}

${
  failedCount > 0
    ? `❌ ${failedCount} fixes failed — manual review needed`
    : ''
}

## Pending Approval (${orchestrationResult.pendingApproval.length})

${
  orchestrationResult.pendingApproval.length > 0
    ? orchestrationResult.pendingApproval
        .slice(0, 5)
        .map((s) => `- **${s.title}** (${s.severity}, ${(s.confidence * 100).toFixed(0)}%)`)
        .join('\n')
    : '✅ No pending suggestions'
}

${
  orchestrationResult.pendingApproval.length > 5
    ? `\n... and ${orchestrationResult.pendingApproval.length - 5} more`
    : ''
}

## Files Modified

**Auto-Apply:** ${orchestrationResult.files.autoApply.length} files
**Needs Review:** ${orchestrationResult.files.manualReview.length} files
**High Risk:** ${orchestrationResult.files.highRisk.length} files

## Next Steps

${
  appliedCount > 0
    ? '1. ✅ Auto-fixes applied — review changes\n'
    : ''
}
${
  orchestrationResult.pendingApproval.length > 0
    ? '1. 👤 Review and approve suggestions\n2. 🚀 Run tests\n3. ✅ Commit approved changes\n'
    : '1. 🚀 Run tests\n2. ✅ Merge to main\n'
}

---
*Generated by Faz 4b ECC Integration*
`;
}

/**
 * Simulate agent report for testing
 */
export function createMockAgentReport(agentName: string): AgentReport {
  const reports: Record<string, AgentReport> = {
    'code-quality': {
      agentName: 'code-quality',
      timestamp: new Date(),
      status: 'success',
      duration: 2340,
      issues: [
        {
          type: 'unused-variable',
          severity: 'warning',
          message: 'Unused variable "preset"',
          file: 'src/core/ai/perplexity.ts',
          line: 15,
        },
        {
          type: 'array-type',
          severity: 'error',
          message: 'Array<T> should be T[]',
          file: 'src/core/ai/perplexity.ts',
          line: 22,
        },
      ],
    },

    'mobile-qa': {
      agentName: 'mobile-qa',
      timestamp: new Date(),
      status: 'partial',
      duration: 8234,
      tests: [
        {
          name: 'TechnicalServiceFormScreen render',
          passed: true,
          file: 'src/features/technicalService/screens/__tests__/TechnicalServiceFormScreen.test.tsx',
        },
        {
          name: 'Repair estimate button click',
          passed: false,
          error: 'Cannot read property "answer" of null',
          file: 'src/features/technicalService/screens/__tests__/TechnicalServiceFormScreen.test.tsx',
        },
      ],
    },

    'security-scanner': {
      agentName: 'security-scanner',
      timestamp: new Date(),
      status: 'success',
      duration: 3456,
      vulnerabilities: [
        {
          package: 'lodash',
          severity: 'medium',
          fix: 'npm update lodash@4.17.21',
        },
      ],
    },

    'build-optimizer': {
      agentName: 'build-optimizer',
      timestamp: new Date(),
      status: 'success',
      duration: 5678,
      issues: [
        {
          type: 'bundle-size',
          severity: 'warning',
          message: 'Bundle size increased by 2.3KB',
          file: 'dist/bundle.js',
        },
      ],
    },
  };

  return reports[agentName] || reports['code-quality'];
}

/**
 * Integration helper for post-commit hook
 */
export async function runECCIntegration(
  commitMessage: string,
  branchName: string,
  commitHash: string
): Promise<{ report: string; autoAppliedCount: number }> {
  console.log(`\n🔗 ECC Integration: Processing commit ${commitHash.slice(0, 7)}\n`);

  // In production: read actual agent reports from .ecc/reports/
  // For now: simulate with mock data
  const mockReports = [
    createMockAgentReport('code-quality'),
    createMockAgentReport('mobile-qa'),
    createMockAgentReport('security-scanner'),
  ];

  const result = await processAgentReports(mockReports, {
    autoApplyLowRisk: true,
    autoApplyMediumRisk: false,
  });

  const report = generateECCHookOutput({
    orchestrationResult: result.orchestrationResult,
    autoApplied: result.autoApplied,
    branchName,
    commitHash,
  });

  const autoAppliedCount = result.autoApplied.filter(
    (r) => r.status === 'applied'
  ).length;

  console.log(report);

  return { report, autoAppliedCount };
}
