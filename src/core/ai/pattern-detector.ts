/**
 * Pattern Detector — Finds recurring patterns in code issues
 * Learns from history to predict and prevent future problems
 */

import { LearningState, learnSuggestionPattern, updateFileRiskProfile } from './learning-metrics';
import { Suggestion } from './suggestions';

export interface CodePattern {
  id: string;
  name: string;
  description: string;
  filePattern: RegExp; // files affected
  issuePattern: RegExp; // issue type pattern
  frequency: number; // how often seen
  severity: 'low' | 'medium' | 'high';
  autoFixAvailable: boolean;
  relatedPatterns: string[]; // other patterns that co-occur
  lastDetected: Date;
  preventionTips: string[];
}

export interface PatternMatch {
  pattern: CodePattern;
  matchedFiles: string[];
  matchedIssues: string[];
  confidence: number; // 0-1
  predictedNextOccurrence?: Date;
  suggestedFix?: string;
}

/**
 * Built-in patterns library
 */
export const KNOWN_PATTERNS: CodePattern[] = [
  {
    id: 'unused-imports',
    name: 'Unused Imports',
    description: 'Import statements that are declared but never used',
    filePattern: /\.(ts|tsx)$/,
    issuePattern: /unused.*import/i,
    frequency: 0,
    severity: 'low',
    autoFixAvailable: true,
    relatedPatterns: ['unused-variables'],
    lastDetected: new Date(),
    preventionTips: [
      'Use eslint rule: no-unused-vars',
      'IDE can auto-remove on save',
      'Run eslint --fix regularly',
    ],
  },

  {
    id: 'unused-variables',
    name: 'Unused Variables',
    description: 'Variables declared but never referenced',
    filePattern: /\.(ts|tsx)$/,
    issuePattern: /unused.*variable/i,
    frequency: 0,
    severity: 'low',
    autoFixAvailable: true,
    relatedPatterns: ['unused-imports'],
    lastDetected: new Date(),
    preventionTips: [
      'Enable TypeScript strict mode',
      'Use eslint rule: no-unused-vars',
      'Prefix with underscore if intentional: _unused',
    ],
  },

  {
    id: 'null-check-missing',
    name: 'Missing Null Checks',
    description: 'Accessing property on potentially null/undefined value',
    filePattern: /\.(ts|tsx)$/,
    issuePattern: /cannot read property|null/i,
    frequency: 0,
    severity: 'high',
    autoFixAvailable: false,
    relatedPatterns: ['type-safety'],
    lastDetected: new Date(),
    preventionTips: [
      'Enable TypeScript --strictNullChecks',
      'Use optional chaining: obj?.property',
      'Add null guards: if (obj) { ... }',
      'Use type guards and assertions carefully',
    ],
  },

  {
    id: 'type-mismatch',
    name: 'Type Mismatches',
    description: 'Using wrong type for variable/parameter',
    filePattern: /\.(ts|tsx)$/,
    issuePattern: /type.*error|mismatch/i,
    frequency: 0,
    severity: 'medium',
    autoFixAvailable: true,
    relatedPatterns: ['null-check-missing'],
    lastDetected: new Date(),
    preventionTips: [
      'Enable TypeScript strict mode',
      'Use explicit type annotations',
      'Run type checker in CI/CD',
      'Review IDE type hints',
    ],
  },

  {
    id: 'array-type-format',
    name: 'Array Type Format',
    description: 'Using Array<T> instead of T[] (style consistency)',
    filePattern: /\.(ts|tsx)$/,
    issuePattern: /array.*type|Array<T>/i,
    frequency: 0,
    severity: 'low',
    autoFixAvailable: true,
    relatedPatterns: [],
    lastDetected: new Date(),
    preventionTips: [
      'Configure ESLint: array-type rule',
      'Use automatic formatting: prettier + eslint',
      'Setup git pre-commit hook',
    ],
  },

  {
    id: 'security-vulnerability',
    name: 'Security Vulnerability',
    description: 'Known CVE or security issue in dependency',
    filePattern: /package\.json$/,
    issuePattern: /vulnerability|cve|security/i,
    frequency: 0,
    severity: 'high',
    autoFixAvailable: true,
    relatedPatterns: ['dependency-outdated'],
    lastDetected: new Date(),
    preventionTips: [
      'Run npm audit regularly',
      'Use automated dependency updates (Dependabot)',
      'Monitor security advisories',
      'Keep dependencies up to date',
    ],
  },

  {
    id: 'test-failure-regression',
    name: 'Test Failure (Regression)',
    description: 'Previously passing test now fails',
    filePattern: /\.test\.(ts|tsx)$/,
    issuePattern: /test.*fail|failed.*test/i,
    frequency: 0,
    severity: 'high',
    autoFixAvailable: false,
    relatedPatterns: ['logic-error'],
    lastDetected: new Date(),
    preventionTips: [
      'Run tests before committing',
      'Add pre-commit hook with tests',
      'Use CI/CD to block failing commits',
      'Write tests for edge cases',
    ],
  },

  {
    id: 'performance-regression',
    name: 'Performance Regression',
    description: 'Performance metric increased (slower)',
    filePattern: /\.(ts|tsx|js|jsx)$/,
    issuePattern: /performance|bundle.*size|latency/i,
    frequency: 0,
    severity: 'medium',
    autoFixAvailable: false,
    relatedPatterns: ['bundle-bloat'],
    lastDetected: new Date(),
    preventionTips: [
      'Use performance profiling tools',
      'Set performance budgets',
      'Monitor bundle size in CI/CD',
      'Review and optimize hot paths',
    ],
  },
];

/**
 * Detect patterns in suggestions
 */
export function detectPatterns(
  suggestions: Suggestion[],
  learningState: LearningState
): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const pattern of KNOWN_PATTERNS) {
    const matchedFiles: Set<string> = new Set();
    const matchedIssues: Set<string> = new Set();
    let matchCount = 0;

    for (const suggestion of suggestions) {
      // Check if suggestion matches this pattern
      if (
        pattern.issuePattern.test(suggestion.title) ||
        pattern.issuePattern.test(suggestion.description)
      ) {
        matchCount++;
        suggestion.files.forEach((f) => matchedFiles.add(f));
        matchedIssues.add(suggestion.type);

        // Learn from this match
        learnSuggestionPattern(learningState, {
          type: pattern.id,
          files: suggestion.files,
          agentSource: suggestion.agentSource,
          confidence: suggestion.confidence,
          success: suggestion.status === 'applied',
        });
      }

      // Also check file pattern
      for (const file of suggestion.files) {
        if (pattern.filePattern.test(file)) {
          // This file is in the pattern's domain
          updateFileRiskProfile(learningState, file, {
            suggestionCount: 1,
            hasFailed: suggestion.severity === 'high',
            issueTypes: [pattern.id],
          });
        }
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on match count and pattern frequency
      const confidence = Math.min(1, matchCount / 5 + pattern.frequency / 100);

      matches.push({
        pattern,
        matchedFiles: Array.from(matchedFiles),
        matchedIssues: Array.from(matchedIssues),
        confidence,
        predictedNextOccurrence: new Date(
          Date.now() + pattern.frequency * 24 * 60 * 60 * 1000
        ), // rough estimate
        suggestedFix: pattern.autoFixAvailable
          ? `Automatically fixable with eslint --fix or similar`
          : undefined,
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Find co-occurring patterns
 */
export function findRelatedPatterns(
  pattern: CodePattern,
  matches: PatternMatch[]
): PatternMatch[] {
  return matches.filter((m) =>
    pattern.relatedPatterns.includes(m.pattern.id)
  );
}

/**
 * Predict next issue type based on patterns
 */
export function predictNextIssue(
  learningState: LearningState,
  file: string
): { issue: string; confidence: number } | null {
  const fileRisk = learningState.fileRisks.get(file);
  if (!fileRisk || fileRisk.commonIssues.size === 0) {
    return null;
  }

  // Find most common issue
  let topIssue = '';
  let topCount = 0;

  for (const [issue, count] of fileRisk.commonIssues) {
    if (count > topCount) {
      topCount = count;
      topIssue = issue;
    }
  }

  // Confidence based on pattern frequency
  const pattern = KNOWN_PATTERNS.find((p) => p.id === topIssue);
  const patternFrequency = pattern?.frequency || 1;
  const confidence = Math.min(
    1,
    topCount / Math.max(1, fileRisk.totalSuggestions) + patternFrequency / 100
  );

  return { issue: topIssue, confidence };
}

/**
 * Generate pattern report
 */
export function generatePatternReport(
  matches: PatternMatch[],
  learningState: LearningState
): string {
  if (matches.length === 0) {
    return '✅ No recurring patterns detected yet. Keep learning!\n';
  }

  let report = `# 🎯 Pattern Detection Report\n\n`;
  report += `## Detected Patterns (${matches.length})\n\n`;

  for (const match of matches.slice(0, 10)) {
    const p = match.pattern;
    report += `### ${p.name}\n`;
    report += `- **Description:** ${p.description}\n`;
    report += `- **Confidence:** ${(match.confidence * 100).toFixed(0)}%\n`;
    report += `- **Severity:** ${p.severity.toUpperCase()}\n`;
    report += `- **Files Affected:** ${match.matchedFiles.slice(0, 3).join(', ')}${match.matchedFiles.length > 3 ? ` (+${match.matchedFiles.length - 3} more)` : ''}\n`;

    if (match.suggestedFix) {
      report += `- **Fix:** ${match.suggestedFix}\n`;
    }

    if (p.preventionTips.length > 0) {
      report += `- **Prevention:**\n`;
      for (const tip of p.preventionTips.slice(0, 2)) {
        report += `  - ${tip}\n`;
      }
    }

    report += '\n';
  }

  if (matches.length > 10) {
    report += `... and ${matches.length - 10} more patterns\n\n`;
  }

  // Co-occurrence analysis
  const coOccurrences = new Map<string, number>();
  for (const match of matches) {
    for (const related of match.pattern.relatedPatterns) {
      const count = coOccurrences.get(related) || 0;
      coOccurrences.set(related, count + 1);
    }
  }

  if (coOccurrences.size > 0) {
    report += `## Related Patterns (Often Occur Together)\n\n`;
    for (const [pattern, count] of Array.from(coOccurrences.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)) {
      report += `- ${pattern} (${count})\n`;
    }
  }

  return report;
}

/**
 * Get prevention tips for all matched patterns
 */
export function getPreventionTips(
  matches: PatternMatch[]
): { pattern: string; tips: string[] }[] {
  return matches
    .filter((m) => m.pattern.preventionTips.length > 0)
    .map((m) => ({
      pattern: m.pattern.name,
      tips: m.pattern.preventionTips,
    }));
}
