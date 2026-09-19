/**
 * Learning Orchestrator — Coordinates learning from each run
 * Trains on suggestions, patterns, and outcomes to improve future predictions
 */

import {
  LearningState,
  createLearningState,
  recordAgentRun,
  generateLearningInsights,
  getOptimizationRecommendations,
  getLearningReport,
} from './learning-metrics';
import {
  detectPatterns,
  generatePatternReport,
  getPreventionTips,
  PatternMatch,
} from './pattern-detector';
import { Suggestion } from './suggestions';
import { ApplyResult } from './auto-apply';
import { syncLearningState, loadLearningState } from './learning-persistence';

export interface LearningInput {
  agentReports: Array<{
    agentName: string;
    duration: number;
    success: boolean;
    failures?: string[];
    suggestionsCount: number;
    appliedCount: number;
  }>;
  suggestions: Suggestion[];
  autoApplyResults: ApplyResult[];
  commitHash: string;
  branchName: string;
}

export interface LearningOutput {
  state: LearningState;
  patterns: PatternMatch[];
  insights: string[];
  optimizations: {
    agentOrdering: string[];
    estimatedDuration: number;
    skipAgents: Set<string>;
  };
  patternReport: string;
  learningReport: string;
  recommendations: string[];
}

/**
 * Process learning from a full run
 */
export async function learnFromRun(
  state: LearningState,
  input: LearningInput
): Promise<LearningOutput> {
  console.log(`\n🧠 Learning from run: ${input.commitHash.slice(0, 7)}\n`);

  // Step 1: Record agent metrics
  for (const report of input.agentReports) {
    recordAgentRun(state, report.agentName, {
      duration: report.duration,
      success: report.success,
      failures: report.failures,
      suggestionsCount: report.suggestionsCount,
      appliedCount: report.appliedCount,
    });
  }

  // Step 2: Detect patterns
  const patterns = detectPatterns(input.suggestions, state);
  console.log(`✓ Detected ${patterns.length} patterns`);

  // Step 3: Generate insights
  const insights = generateLearningInsights(state);
  const insightTitles = insights.map((i) => i.title);
  console.log(`✓ Generated ${insights.length} insights`);

  // Step 4: Get optimization recommendations
  const optimizations = getOptimizationRecommendations(state);
  console.log(`✓ Agent ordering optimized: ${optimizations.agentOrdering.join(' → ')}`);

  // Step 5: Generate reports
  const patternReport = generatePatternReport(patterns, state);
  const learningReport = getLearningReport(state);

  // Step 6: Build recommendations
  const recommendations = buildRecommendations(
    state,
    patterns,
    insights,
    optimizations
  );
  console.log(`✓ Generated ${recommendations.length} recommendations`);

  // Step 7: Update confidence
  updateLearningConfidence(state, input);

  // Step 8: Persist learning state to disk
  try {
    syncLearningState(state, patterns, {
      branch: input.branchName,
      project: 'dusukbutce-mobile',
      createBackup: true,
    });
    console.log(`✓ Learning state persisted to disk`);
  } catch (error) {
    console.error(`✗ Failed to persist learning state:`, error);
  }

  console.log(`\n✅ Learning phase complete`);
  console.log(`   Confidence: ${(state.learningConfidence * 100).toFixed(0)}%`);
  console.log(`   Next optimization run ~${(optimizations.estimatedDuration / 1000).toFixed(1)}s\n`);

  return {
    state,
    patterns,
    insights: insightTitles,
    optimizations: {
      agentOrdering: optimizations.agentOrdering,
      estimatedDuration: optimizations.estDuration,
      skipAgents: optimizations.skipAgents,
    },
    patternReport,
    learningReport,
    recommendations,
  };
}

/**
 * Build recommendations from insights and patterns
 */
function buildRecommendations(
  state: LearningState,
  patterns: PatternMatch[],
  insights: any[],
  optimizations: any
): string[] {
  const recommendations: string[] = [];

  // Recommendation 1: File refactoring
  for (const [file, profile] of state.fileRisks) {
    if (profile.riskScore > 0.7) {
      recommendations.push(
        `🔴 HIGH RISK: ${file} needs refactoring (${profile.totalSuggestions} suggestions, ${profile.failureCount} failures)`
      );
    }
  }

  // Recommendation 2: Pattern prevention
  for (const match of patterns.slice(0, 3)) {
    if (match.confidence > 0.8) {
      const tips = match.pattern.preventionTips.slice(0, 1);
      if (tips.length > 0) {
        recommendations.push(
          `💡 PATTERN: ${match.pattern.name} — ${tips[0]}`
        );
      }
    }
  }

  // Recommendation 3: Agent optimization
  for (const agent of optimizations.skipAgents) {
    recommendations.push(
      `⚡ OPTIMIZATION: Skip ${agent} on next run (100% success rate recently)`
    );
  }

  // Recommendation 4: Learning milestones
  if (state.totalRuns === 10) {
    recommendations.push(
      `🎓 MILESTONE: 10 runs completed! System is starting to learn patterns.`
    );
  } else if (state.totalRuns === 50) {
    recommendations.push(
      `🎓 MILESTONE: 50 runs! High confidence learning activated (80%+).`
    );
  }

  return recommendations;
}

/**
 * Update learning confidence based on data quality
 */
function updateLearningConfidence(
  state: LearningState,
  input: LearningInput
): void {
  // Confidence increases with:
  // - More total runs (50+ = very confident)
  // - More patterns detected (indicates rich data)
  // - Consistent agent performance

  let confidence = 0;

  // Factor 1: Run count (0-0.4)
  confidence += Math.min(0.4, state.totalRuns / 50);

  // Factor 2: Pattern consistency (0-0.3)
  const consistentPatterns = Array.from(state.patterns.values()).filter(
    (p) => p.frequency > 3
  ).length;
  confidence += Math.min(0.3, consistentPatterns / 10);

  // Factor 3: Agent consistency (0-0.3)
  let consistentAgents = 0;
  for (const metrics of state.agents.values()) {
    if (metrics.successRate > 0.8) {
      consistentAgents++;
    }
  }
  confidence += Math.min(
    0.3,
    consistentAgents / Math.max(1, state.agents.size)
  );

  state.learningConfidence = Math.min(1, confidence);
}

/**
 * Export learning state (for persistence)
 */
export function exportLearningState(state: LearningState): string {
  return JSON.stringify(
    {
      agents: Array.from(state.agents.entries()),
      patterns: Array.from(state.patterns.entries()),
      fileRisks: Array.from(state.fileRisks.entries()),
      insights: state.insights,
      totalRuns: state.totalRuns,
      lastAnalysis: state.lastAnalysis,
      learningConfidence: state.learningConfidence,
    },
    null,
    2
  );
}

/**
 * Import learning state (from persistence)
 */
export function importLearningState(json: string): LearningState {
  const data = JSON.parse(json);
  const state = createLearningState();

  state.agents = new Map(data.agents);
  state.patterns = new Map(
    data.patterns.map((p: any[]) => [
      p[0],
      {
        ...p[1],
        filesAffected: new Set(p[1].filesAffected),
        agents: new Set(p[1].agents),
      },
    ])
  );
  state.fileRisks = new Map(
    data.fileRisks.map((f: any[]) => [
      f[0],
      {
        ...f[1],
        commonIssues: new Map(f[1].commonIssues),
      },
    ])
  );
  state.insights = data.insights;
  state.totalRuns = data.totalRuns;
  state.lastAnalysis = new Date(data.lastAnalysis);
  state.learningConfidence = data.learningConfidence;

  return state;
}

/**
 * Get current learning status
 */
export function getLearningStatus(state: LearningState): {
  isLearning: boolean;
  confidence: number;
  dataPoints: number;
  readyForOptimization: boolean;
} {
  return {
    isLearning: state.totalRuns > 0,
    confidence: state.learningConfidence,
    dataPoints:
      state.totalRuns +
      state.patterns.size * 10 +
      state.fileRisks.size * 5,
    readyForOptimization:
      state.totalRuns > 10 && state.learningConfidence > 0.6,
  };
}

/**
 * Generate summary for dashboard
 */
export function getLearningDashboardSummary(
  learningOutput: LearningOutput
): string {
  const { state, patterns, recommendations } = learningOutput;

  return `
# 🧠 Learning Dashboard

## Status
- **Total Runs:** ${state.totalRuns}
- **Learning Confidence:** ${(state.learningConfidence * 100).toFixed(0)}%
- **Patterns Detected:** ${state.patterns.size}
- **High-Risk Files:** ${Array.from(state.fileRisks.values()).filter((p) => p.riskScore > 0.7).length}

## Latest Insights (Top 3)
${recommendations.slice(0, 3).map((r) => `- ${r}`).join('\n')}

## Optimization Opportunity
${
  learningOutput.optimizations.skipAgents.size > 0
    ? `Skip ${Array.from(learningOutput.optimizations.skipAgents).join(', ')} on next run (100% success)`
    : 'Run all agents (still learning)'
}

**Estimated time saved:** ${(
    (Array.from(state.agents.values()).reduce((sum, a) => sum + a.averageDuration, 0) -
      learningOutput.optimizations.estimatedDuration) /
    1000
  ).toFixed(1)}s per run

---
*Next optimization in ${Math.ceil(Math.max(10 - state.totalRuns, 0) / 2)} runs*
`;
}

/**
 * Initialize learning system with persistence
 * Loads state from disk if available, otherwise creates new
 */
export async function initializeLearningWithPersistence(): Promise<LearningState> {
  console.log(`\n📊 Initializing Learning System with Persistence...\n`);

  const persisted = loadLearningState();

  if (persisted) {
    console.log(`✅ Loaded learning state from disk`);
    console.log(`   Confidence: ${(persisted.state.learningConfidence * 100).toFixed(0)}%`);
    console.log(`   Total runs: ${persisted.state.totalRuns}`);
    console.log(`   Patterns: ${persisted.patterns.length}`);
    console.log(`   Timestamp: ${persisted.timestamp}\n`);
    return persisted.state;
  } else {
    console.log(`✅ Starting fresh learning system (no prior state found)\n`);
    return createLearningState();
  }
}
