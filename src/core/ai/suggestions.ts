/**
 * Suggestion Engine — Autonomous fix suggestions for ECC agents
 * Generates fix suggestions based on agent reports with risk classification
 */

export type RiskLevel = 'low' | 'medium' | 'high';
export type ActionType = 'auto_apply' | 'manual_approval' | 'manual_only';
export type SuggestionType =
  | 'format-fix'
  | 'lint-fix'
  | 'type-fix'
  | 'import-cleanup'
  | 'null-check'
  | 'test-fix'
  | 'dependency-update'
  | 'security-patch'
  | 'logic-fix'
  | 'null-safety';

export interface SuggestionFix {
  description: string;
  code?: string; // Suggested code change
  file: string;
  lineNumber?: number;
}

export interface Suggestion {
  id: string; // UUID
  type: SuggestionType;
  severity: RiskLevel;
  title: string;
  description: string;
  files: string[];
  fixes: SuggestionFix[];
  reasoning: string; // Why this suggestion
  confidence: number; // 0-1, prediction confidence
  action: ActionType;
  agentSource: string; // Which agent generated this (code-quality, mobile-qa, security-scanner, etc.)
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  approvedBy?: string;
  appliedAt?: Date;
  rejectionReason?: string;
}

/**
 * Risk Classification Matrix
 * Determines if fix can be auto-applied or requires manual review
 */
export const riskClassifier = {
  // Low-risk: Auto-apply immediately
  'format-fix': {
    risk: 'low',
    action: 'auto_apply',
    reason: 'Pure formatting, no logic change',
  } as const,

  'lint-fix': {
    risk: 'low',
    action: 'auto_apply',
    reason: 'Eslint auto-fixes are safe',
  } as const,

  'import-cleanup': {
    risk: 'low',
    action: 'auto_apply',
    reason: 'Removing unused imports is safe',
  } as const,

  'type-fix': {
    risk: 'low',
    action: 'auto_apply',
    reason: 'Type annotations only, no runtime change',
  } as const,

  // Medium-risk: Queue for manual review
  'null-check': {
    risk: 'medium',
    action: 'manual_approval',
    reason: 'Logic change required, needs context',
  } as const,

  'test-fix': {
    risk: 'medium',
    action: 'manual_approval',
    reason: 'Test modifications need verification',
  } as const,

  'dependency-update': {
    risk: 'medium',
    action: 'manual_approval',
    reason: 'Dependency changes may have side effects',
  } as const,

  // High-risk: Always manual
  'security-patch': {
    risk: 'high',
    action: 'manual_only',
    reason: 'Security changes require careful review',
  } as const,

  'logic-fix': {
    risk: 'high',
    action: 'manual_only',
    reason: 'Business logic changes need approval',
  } as const,

  'null-safety': {
    risk: 'high',
    action: 'manual_only',
    reason: 'Null safety is critical, needs design review',
  } as const,
};

/**
 * Generate a suggestion from agent output
 */
export function generateSuggestion(params: {
  type: SuggestionType;
  title: string;
  description: string;
  files: string[];
  fixes: SuggestionFix[];
  reasoning: string;
  confidence: number;
  agentSource: string;
}): Suggestion {
  const riskInfo = riskClassifier[params.type];
  const id = `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    type: params.type,
    severity: riskInfo.risk,
    title: params.title,
    description: params.description,
    files: params.files,
    fixes: params.fixes,
    reasoning: params.reasoning,
    confidence: params.confidence,
    action: riskInfo.action,
    agentSource: params.agentSource,
    timestamp: new Date(),
    status: 'pending',
  };
}

/**
 * Filter suggestions by risk level + action type
 */
export function filterSuggestions(
  suggestions: Suggestion[],
  options?: {
    riskLevel?: RiskLevel;
    actionType?: ActionType;
    agentSource?: string;
  }
): Suggestion[] {
  return suggestions.filter((s) => {
    if (options?.riskLevel && s.severity !== options.riskLevel) return false;
    if (options?.actionType && s.action !== options.actionType) return false;
    if (options?.agentSource && s.agentSource !== options.agentSource)
      return false;
    return true;
  });
}

/**
 * Get auto-applicable suggestions
 */
export function getAutoApplicableSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return filterSuggestions(suggestions, { actionType: 'auto_apply' });
}

/**
 * Get manual review suggestions (sorted by confidence)
 */
export function getManualSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return filterSuggestions(suggestions, { actionType: 'manual_approval' }).sort(
    (a, b) => b.confidence - a.confidence
  );
}

/**
 * Agent-specific suggestion generators
 */

export namespace AgentSuggestions {
  /**
   * code-quality agent → suggestion
   */
  export function fromCodeQuality(params: {
    issues: Array<{ type: string; file: string; line: number; message: string }>;
  }): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const issue of params.issues) {
      let type: SuggestionType = 'lint-fix';
      let confidence = 0.95;

      if (issue.type === 'unused-variable') {
        type = 'lint-fix';
        confidence = 0.99;
      } else if (issue.type === 'array-type') {
        type = 'type-fix';
        confidence = 0.98;
      } else if (issue.type === 'unused-import') {
        type = 'import-cleanup';
        confidence = 0.99;
      }

      suggestions.push(
        generateSuggestion({
          type,
          title: `Fix: ${issue.message}`,
          description: `${issue.type} at ${issue.file}:${issue.line}`,
          files: [issue.file],
          fixes: [
            {
              description: issue.message,
              file: issue.file,
              lineNumber: issue.line,
            },
          ],
          reasoning: `ESLint/TypeScript detected: ${issue.message}`,
          confidence,
          agentSource: 'code-quality',
        })
      );
    }

    return suggestions;
  }

  /**
   * mobile-qa agent → suggestion
   */
  export function fromMobileQA(params: {
    failures: Array<{
      test: string;
      error: string;
      file: string;
      suggestion?: string;
    }>;
  }): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const failure of params.failures) {
      let type: SuggestionType = 'null-check';
      let confidence = 0.8;

      if (failure.error.includes('Cannot read property')) {
        type = 'null-check';
        confidence = 0.9;
      } else if (failure.error.includes('import')) {
        type = 'import-cleanup';
        confidence = 0.85;
      }

      suggestions.push(
        generateSuggestion({
          type,
          title: `Test Failure: ${failure.test}`,
          description: failure.error,
          files: [failure.file],
          fixes: [
            {
              description: failure.suggestion || failure.error,
              file: failure.file,
            },
          ],
          reasoning: `Test failed: ${failure.error}`,
          confidence,
          agentSource: 'mobile-qa',
        })
      );
    }

    return suggestions;
  }

  /**
   * security-scanner agent → suggestion
   */
  export function fromSecurityScanner(params: {
    vulnerabilities: Array<{
      package: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      fix: string;
    }>;
  }): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const vuln of params.vulnerabilities) {
      const riskMap = {
        critical: 'high' as RiskLevel,
        high: 'high' as RiskLevel,
        medium: 'medium' as RiskLevel,
        low: 'low' as RiskLevel,
      };

      suggestions.push(
        generateSuggestion({
          type: 'security-patch',
          title: `Security: ${vuln.package} ${vuln.severity}`,
          description: `Update ${vuln.package} to patched version`,
          files: ['package.json'],
          fixes: [
            {
              description: vuln.fix,
              file: 'package.json',
            },
          ],
          reasoning: `${vuln.severity} vulnerability in ${vuln.package}`,
          confidence: 0.99,
          agentSource: 'security-scanner',
        })
      );
    }

    return suggestions;
  }
}

/**
 * Suggestion formatter for reports
 */
export function formatSuggestionForReport(s: Suggestion): string {
  return `### ${s.title}

**Type:** \`${s.type}\`
**Risk:** ${s.severity.toUpperCase()} (${s.action})
**Confidence:** ${(s.confidence * 100).toFixed(0)}%
**Source:** ${s.agentSource}

**Description:** ${s.description}

**Reasoning:** ${s.reasoning}

**Files Affected:**
${s.files.map((f) => `- \`${f}\``).join('\n')}

**Fixes:**
${s.fixes.map((f) => `- ${f.description}${f.lineNumber ? ` (line ${f.lineNumber})` : ''}`).join('\n')}
`;
}
