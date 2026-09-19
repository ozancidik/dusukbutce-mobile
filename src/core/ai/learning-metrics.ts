/**
 * Learning Metrics — Track and analyze patterns for continuous improvement
 * Learns from agent runs, suggestions, and fixes to predict and prevent issues
 */

export interface AgentMetrics {
  agentName: string;
  runCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number; // milliseconds
  lastRunTime: Date;
  successRate: number; // 0-1
  commonFailures: Map<string, number>; // error → count
  suggestionsGenerated: number;
  suggestionsApplied: number;
}

export interface SuggestionPattern {
  type: string; // lint-fix, null-check, etc.
  frequency: number; // how often seen
  successRate: number; // fix success rate
  averageConfidence: number; // 0-1
  filesAffected: Set<string>;
  agents: Set<string>; // which agents create this
  lastSeen: Date;
  predictability: number; // 0-1, how predictable
}

export interface FileRiskProfile {
  path: string;
  totalSuggestions: number;
  failureCount: number;
  commonIssues: Map<string, number>; // issue type → count
  riskScore: number; // 0-1, higher = more risky
  hasKnownPatterns: boolean;
  predictedNextIssue?: string;
  lastModified: Date;
}

export interface LearningInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'optimization' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable: boolean;
  recommendation?: string;
  affectedFiles?: string[];
  generatedAt: Date;
  impactScore: number; // estimated value of applying this
}

export interface LearningState {
  agents: Map<string, AgentMetrics>;
  patterns: Map<string, SuggestionPattern>;
  fileRisks: Map<string, FileRiskProfile>;
  insights: LearningInsight[];
  totalRuns: number;
  lastAnalysis: Date;
  learningConfidence: number; // 0-1, how much we trust our predictions
}

/**
 * Initialize learning state
 */
export function createLearningState(): LearningState {
  return {
    agents: new Map(),
    patterns: new Map(),
    fileRisks: new Map(),
    insights: [],
    totalRuns: 0,
    lastAnalysis: new Date(),
    learningConfidence: 0,
  };
}

/**
 * Record agent run metrics
 */
export function recordAgentRun(
  state: LearningState,
  agentName: string,
  params: {
    duration: number;
    success: boolean;
    failures?: string[];
    suggestionsCount: number;
    appliedCount: number;
  }
): void {
  let metrics = state.agents.get(agentName);

  if (!metrics) {
    metrics = {
      agentName,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      averageDuration: 0,
      lastRunTime: new Date(),
      successRate: 0,
      commonFailures: new Map(),
      suggestionsGenerated: 0,
      suggestionsApplied: 0,
    };
    state.agents.set(agentName, metrics);
  }

  // Update metrics
  metrics.runCount++;
  metrics.averageDuration =
    (metrics.averageDuration * (metrics.runCount - 1) + params.duration) /
    metrics.runCount;
  metrics.lastRunTime = new Date();
  metrics.suggestionsGenerated += params.suggestionsCount;
  metrics.suggestionsApplied += params.appliedCount;

  if (params.success) {
    metrics.successCount++;
  } else {
    metrics.failureCount++;

    // Track common failures
    if (params.failures) {
      for (const failure of params.failures) {
        const count = metrics.commonFailures.get(failure) || 0;
        metrics.commonFailures.set(failure, count + 1);
      }
    }
  }

  metrics.successRate = metrics.successCount / metrics.runCount;
  state.totalRuns++;
}

/**
 * Learn suggestion patterns
 */
export function learnSuggestionPattern(
  state: LearningState,
  params: {
    type: string;
    files: string[];
    agentSource: string;
    confidence: number;
    success: boolean;
  }
): void {
  const key = `${params.type}:${params.agentSource}`;
  let pattern = state.patterns.get(key);

  if (!pattern) {
    pattern = {
      type: params.type,
      frequency: 0,
      successRate: 0,
      averageConfidence: 0,
      filesAffected: new Set(),
      agents: new Set(),
      lastSeen: new Date(),
      predictability: 0,
    };
    state.patterns.set(key, pattern);
  }

  pattern.frequency++;
  pattern.averageConfidence =
    (pattern.averageConfidence * (pattern.frequency - 1) + params.confidence) /
    pattern.frequency;
  pattern.lastSeen = new Date();
  pattern.agents.add(params.agentSource);

  for (const file of params.files) {
    pattern.filesAffected.add(file);
  }

  if (params.success) {
    pattern.successRate =
      (pattern.successRate * (pattern.frequency - 1) + 1) / pattern.frequency;
  }

  // Predictability: patterns with high success and frequency are predictable
  pattern.predictability =
    (pattern.frequency > 5 ? 1 : pattern.frequency / 5) *
    pattern.successRate;
}

/**
 * Update file risk profile
 */
export function updateFileRiskProfile(
  state: LearningState,
  file: string,
  params: {
    suggestionCount: number;
    hasFailed: boolean;
    issueTypes: string[];
  }
): void {
  let profile = state.fileRisks.get(file);

  if (!profile) {
    profile = {
      path: file,
      totalSuggestions: 0,
      failureCount: 0,
      commonIssues: new Map(),
      riskScore: 0,
      hasKnownPatterns: false,
      lastModified: new Date(),
    };
    state.fileRisks.set(file, profile);
  }

  profile.totalSuggestions += params.suggestionCount;
  profile.lastModified = new Date();

  if (params.hasFailed) {
    profile.failureCount++;
  }

  for (const issueType of params.issueTypes) {
    const count = profile.commonIssues.get(issueType) || 0;
    profile.commonIssues.set(issueType, count + 1);
  }

  // Calculate risk score
  const failureRate =
    profile.totalSuggestions > 0
      ? profile.failureCount / profile.totalSuggestions
      : 0;
  profile.riskScore = Math.min(1, failureRate + profile.totalSuggestions / 100);
  profile.hasKnownPatterns = profile.commonIssues.size > 0;
}

/**
 * Predict next issue in file
 */
export function predictFileIssue(
  state: LearningState,
  file: string
): { issue: string; confidence: number } | null {
  const profile = state.fileRisks.get(file);
  if (!profile || profile.commonIssues.size === 0) {
    return null;
  }

  // Find most common issue
  let maxIssue = '';
  let maxCount = 0;

  for (const [issue, count] of profile.commonIssues) {
    if (count > maxCount) {
      maxCount = count;
      maxIssue = issue;
    }
  }

  // Confidence based on frequency
  const confidence = Math.min(1, maxCount / (profile.totalSuggestions || 1));

  return { issue: maxIssue, confidence };
}

/**
 * Generate learning insights
 */
export function generateLearningInsights(
  state: LearningState
): LearningInsight[] {
  const insights: LearningInsight[] = [];

  // Insight 1: High-risk files
  for (const [file, profile] of state.fileRisks) {
    if (profile.riskScore > 0.7) {
      insights.push({
        id: `insight_highRisk_${file}`,
        type: 'warning',
        title: `High-Risk File: ${file}`,
        description: `File has ${profile.totalSuggestions} suggestions with ${profile.failureCount} failures`,
        confidence: Math.min(1, profile.totalSuggestions / 10),
        actionable: true,
        recommendation: `Add extra review for ${file}. Consider refactoring.`,
        affectedFiles: [file],
        generatedAt: new Date(),
        impactScore: profile.riskScore * profile.totalSuggestions,
      });
    }
  }

  // Insight 2: Predictable patterns
  for (const [key, pattern] of state.patterns) {
    if (pattern.predictability > 0.8) {
      insights.push({
        id: `insight_pattern_${key}`,
        type: 'pattern',
        title: `Predictable Pattern: ${pattern.type}`,
        description: `Seen ${pattern.frequency} times with ${(pattern.successRate * 100).toFixed(0)}% success rate`,
        confidence: pattern.predictability,
        actionable: true,
        recommendation: `Automatically apply similar fixes for ${pattern.type}`,
        affectedFiles: Array.from(pattern.filesAffected).slice(0, 5),
        generatedAt: new Date(),
        impactScore: pattern.frequency * pattern.successRate,
      });
    }
  }

  // Insight 3: Agent performance
  for (const [name, metrics] of state.agents) {
    if (metrics.successRate < 0.8 && metrics.runCount > 5) {
      insights.push({
        id: `insight_agent_${name}`,
        type: 'optimization',
        title: `Agent Performance: ${name}`,
        description: `${(metrics.successRate * 100).toFixed(0)}% success rate (${metrics.runCount} runs)`,
        confidence: Math.min(1, metrics.runCount / 10),
        actionable: true,
        recommendation: `Review ${name} agent configuration. Common failures: ${Array.from(metrics.commonFailures.keys())
          .slice(0, 3)
          .join(', ')}`,
        generatedAt: new Date(),
        impactScore: (1 - metrics.successRate) * metrics.runCount,
      });
    }
  }

  // Sort by impact
  insights.sort((a, b) => b.impactScore - a.impactScore);

  // Update learning confidence based on data volume
  state.learningConfidence = Math.min(1, state.totalRuns / 50);

  return insights;
}

/**
 * Get optimization recommendations
 */
export function getOptimizationRecommendations(
  state: LearningState
): {
  agentOrdering: string[]; // optimal execution order
  skipAgents: Set<string>; // agents to skip if recent success
  parallelizable: Set<string>[]; // groups that can run in parallel
  estDuration: number; // predicted total duration
} {
  // Sort agents by average duration (fast first)
  const agentOrdering = Array.from(state.agents.entries())
    .sort((a, b) => a[1].averageDuration - b[1].averageDuration)
    .map((e) => e[0]);

  // Skip agents with recent 100% success (waste of time)
  const skipAgents = new Set<string>();
  for (const [name, metrics] of state.agents) {
    if (metrics.successRate === 1 && metrics.runCount > 3) {
      skipAgents.add(name);
    }
  }

  // Group agents that can run in parallel (no dependencies)
  const parallelizable: Set<string>[] = [];
  const grouped = new Set<string>();

  for (const name of agentOrdering) {
    if (!grouped.has(name)) {
      const group = new Set<string>();
      group.add(name);
      grouped.add(name);

      // Add other agents that can run in parallel
      for (const otherName of agentOrdering) {
        if (!grouped.has(otherName)) {
          // Simple heuristic: if both have similar duration, parallelize
          const m1 = state.agents.get(name)!;
          const m2 = state.agents.get(otherName)!;
          if (Math.abs(m1.averageDuration - m2.averageDuration) < 1000) {
            group.add(otherName);
            grouped.add(otherName);
          }
        }
      }

      parallelizable.push(group);
    }
  }

  // Estimate duration (sum of groups)
  const estDuration = parallelizable.reduce((sum, group) => {
    const maxDuration = Math.max(
      ...Array.from(group).map(
        (name) => state.agents.get(name)?.averageDuration || 0
      )
    );
    return sum + maxDuration;
  }, 0);

  return {
    agentOrdering,
    skipAgents,
    parallelizable,
    estDuration,
  };
}

/**
 * Get learning report
 */
export function getLearningReport(state: LearningState): string {
  const insights = generateLearningInsights(state);
  const recommendations = getOptimizationRecommendations(state);

  const report = `
# 🧠 Learning Metrics Report

## Summary

| Metric | Value |
|--------|-------|
| Total Runs | ${state.totalRuns} |
| Learning Confidence | ${(state.learningConfidence * 100).toFixed(0)}% |
| Known Patterns | ${state.patterns.size} |
| High-Risk Files | ${Array.from(state.fileRisks.values()).filter((p) => p.riskScore > 0.7).length} |

## Agent Performance

${
  state.agents.size > 0
    ? Array.from(state.agents.values())
        .map(
          (m) => `
### ${m.agentName}
- Success Rate: ${(m.successRate * 100).toFixed(0)}% (${m.successCount}/${m.runCount})
- Avg Duration: ${m.averageDuration.toFixed(0)}ms
- Suggestions: ${m.suggestionsGenerated} generated, ${m.suggestionsApplied} applied
${m.commonFailures.size > 0 ? `- Common Failures: ${Array.from(m.commonFailures.keys()).slice(0, 3).join(', ')}` : ''}
`
        )
        .join('\n')
    : 'No agent data yet'
}

## Top Insights (${insights.length})

${insights
  .slice(0, 5)
  .map(
    (i, idx) => `
${idx + 1}. **${i.title}** (${(i.confidence * 100).toFixed(0)}% confident)
   - ${i.description}
   ${i.recommendation ? `- Action: ${i.recommendation}` : ''}
`
  )
  .join('\n')}

## Optimization Recommendations

### Optimal Agent Ordering
\`\`\`
${recommendations.agentOrdering.join(' → ')}
\`\`\`

### Estimated Duration
**${(recommendations.estDuration / 1000).toFixed(1)}s** (down from current)

### Skip These (Recent Success)
${Array.from(recommendations.skipAgents).length > 0 ? Array.from(recommendations.skipAgents).join(', ') : 'None'}

### Parallelizable Groups
${recommendations.parallelizable
  .map((g, i) => `${i + 1}. [${Array.from(g).join(', ')}]`)
  .join('\n')}

---
*Generated by Faz 4c Learning System*
*Confidence: ${(state.learningConfidence * 100).toFixed(0)}%*
`;

  return report;
}
