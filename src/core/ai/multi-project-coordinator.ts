/**
 * Multi-Project Coordinator — Unified learning across dusukbutce-web and dusukbutce-mobile
 * Aggregates metrics, detects cross-project patterns, and coordinates optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import { LearningState } from './learning-metrics';
import { PatternMatch } from './pattern-detector';

/**
 * Project information
 */
export interface ProjectInfo {
  name: string;
  path: string;
  type: 'web' | 'mobile';
  isActive: boolean;
  confidence: number;
  totalRuns: number;
  lastUpdated: string;
}

/**
 * Cross-project metrics
 */
export interface CrossProjectMetrics {
  totalRuns: number;
  averageConfidence: number;
  sharedPatterns: Array<{
    patternId: string;
    projects: string[];
    frequency: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  projectMetrics: Map<string, ProjectMetrics>;
}

/**
 * Per-project metrics
 */
export interface ProjectMetrics {
  name: string;
  confidence: number;
  runCount: number;
  successRate: number;
  averageExecutionTime: number;
  criticalPatterns: PatternMatch[];
  highRiskFiles: string[];
}

/**
 * Dependency mapping between projects
 */
export interface ProjectDependency {
  source: string;
  target: string;
  type: 'api' | 'data' | 'library' | 'test';
  status: 'active' | 'deprecated';
  details: string;
}

/**
 * Cross-project insight
 */
export interface CrossProjectInsight {
  id: string;
  title: string;
  projects: string[];
  type: 'pattern' | 'risk' | 'optimization' | 'dependency';
  confidence: number;
  recommendation: string;
  createdAt: string;
}

/**
 * Multi-project coordinator
 */
export class MultiProjectCoordinator {
  private projects: Map<string, ProjectInfo> = new Map();
  private dependencies: ProjectDependency[] = [];
  private sharedMetrics: CrossProjectMetrics | null = null;
  private insights: CrossProjectInsight[] = [];
  private eccDir: string;
  private dataFile: string;

  constructor() {
    this.eccDir = path.join(process.env.HOME || '~', '.ecc', 'multi-project');
    this.dataFile = path.join(this.eccDir, 'coordination.json');
    this.ensureDirectories();
  }

  /**
   * Ensure multi-project directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.eccDir)) {
      fs.mkdirSync(this.eccDir, { recursive: true });
    }
  }

  /**
   * Register a project
   */
  registerProject(
    name: string,
    projectPath: string,
    type: 'web' | 'mobile'
  ): void {
    this.projects.set(name, {
      name,
      path: projectPath,
      type,
      isActive: true,
      confidence: 0,
      totalRuns: 0,
      lastUpdated: new Date().toISOString(),
    });

    console.log(`✅ Registered project: ${name} (${type})`);
  }

  /**
   * Get registered projects
   */
  getProjects(): ProjectInfo[] {
    return Array.from(this.projects.values());
  }

  /**
   * Add dependency between projects
   */
  addDependency(
    source: string,
    target: string,
    type: 'api' | 'data' | 'library' | 'test',
    details: string
  ): void {
    this.dependencies.push({
      source,
      target,
      type,
      status: 'active',
      details,
    });

    console.log(`✅ Dependency added: ${source} → ${target} (${type})`);
  }

  /**
   * Get all dependencies
   */
  getDependencies(): ProjectDependency[] {
    return this.dependencies;
  }

  /**
   * Get dependencies for a project
   */
  getProjectDependencies(projectName: string): {
    outgoing: ProjectDependency[];
    incoming: ProjectDependency[];
  } {
    return {
      outgoing: this.dependencies.filter((d) => d.source === projectName),
      incoming: this.dependencies.filter((d) => d.target === projectName),
    };
  }

  /**
   * Update project metrics from learning state
   */
  updateProjectMetrics(
    projectName: string,
    state: LearningState,
    patterns: PatternMatch[]
  ): void {
    const project = this.projects.get(projectName);
    if (!project) {
      console.warn(`⚠️  Project not found: ${projectName}`);
      return;
    }

    // Update project info
    project.confidence = state.learningConfidence;
    project.totalRuns = state.totalRuns;
    project.lastUpdated = new Date().toISOString();

    // Store project metrics
    const projectMetrics: ProjectMetrics = {
      name: projectName,
      confidence: state.learningConfidence,
      runCount: state.totalRuns,
      successRate: calculateProjectSuccessRate(state),
      averageExecutionTime: calculateAverageExecutionTime(state),
      criticalPatterns: patterns.filter((p) => p.pattern.severity === 'high'),
      highRiskFiles: getHighRiskFiles(state),
    };

    if (!this.sharedMetrics?.projectMetrics) {
      if (!this.sharedMetrics) {
        this.sharedMetrics = {
          totalRuns: 0,
          averageConfidence: 0,
          sharedPatterns: [],
          projectMetrics: new Map(),
        };
      }
    }

    this.sharedMetrics!.projectMetrics.set(projectName, projectMetrics);
    this.calculateAggregateMetrics();

    console.log(`✅ Updated metrics for ${projectName}`);
  }

  /**
   * Calculate aggregate metrics across projects
   */
  private calculateAggregateMetrics(): void {
    if (!this.sharedMetrics) return;

    const metrics = Array.from(this.sharedMetrics.projectMetrics.values());
    if (metrics.length === 0) return;

    // Calculate totals
    this.sharedMetrics.totalRuns = metrics.reduce((sum, m) => sum + m.runCount, 0);
    this.sharedMetrics.averageConfidence =
      metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length;

    // Find shared patterns
    this.detectSharedPatterns();
  }

  /**
   * Detect patterns across projects
   */
  private detectSharedPatterns(): void {
    if (!this.sharedMetrics) return;

    const patternFrequency = new Map<string, { count: number; projects: Set<string> }>();

    for (const [projectName, metrics] of this.sharedMetrics.projectMetrics) {
      for (const pattern of metrics.criticalPatterns) {
        const key = pattern.pattern.name;
        if (!patternFrequency.has(key)) {
          patternFrequency.set(key, { count: 0, projects: new Set() });
        }
        const entry = patternFrequency.get(key)!;
        entry.count++;
        entry.projects.add(projectName);
      }
    }

    // Convert to shared patterns
    this.sharedMetrics.sharedPatterns = Array.from(patternFrequency.entries())
      .filter(([_, data]) => data.projects.size > 1)
      .map(([patternName, data]) => ({
        patternId: patternName.toLowerCase().replace(/\s+/g, '-'),
        projects: Array.from(data.projects),
        frequency: data.count,
        impact: (data.count > 2 ? 'high' : data.count > 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Generate cross-project insights
   */
  generateCrossProjectInsights(): CrossProjectInsight[] {
    const insights: CrossProjectInsight[] = [];

    if (!this.sharedMetrics) return insights;

    // Insight 1: Shared patterns
    for (const pattern of this.sharedMetrics.sharedPatterns) {
      insights.push({
        id: `shared-pattern-${pattern.patternId}`,
        title: `Shared pattern: ${pattern.patternId}`,
        projects: pattern.projects,
        type: 'pattern',
        confidence: pattern.frequency > 2 ? 0.9 : 0.7,
        recommendation: `This pattern appears in ${pattern.projects.join(', ')}. Consider a shared fix across projects.`,
        createdAt: new Date().toISOString(),
      });
    }

    // Insight 2: Confidence disparity
    const metrics = Array.from(this.sharedMetrics.projectMetrics.values());
    const confByProject = new Map(metrics.map((m) => [m.name, m.confidence]));
    const maxConf = Math.max(...metrics.map((m) => m.confidence));
    const minConf = Math.min(...metrics.map((m) => m.confidence));

    if (maxConf - minConf > 0.3) {
      insights.push({
        id: 'confidence-disparity',
        title: 'Confidence levels diverging across projects',
        projects: metrics.map((m) => m.name),
        type: 'optimization',
        confidence: 0.85,
        recommendation: `${Array.from(confByProject.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([p, c]) => `${p}: ${(c * 100).toFixed(0)}%`)
          .join(', ')}. Focus learning on lower-confidence projects.`,
        createdAt: new Date().toISOString(),
      });
    }

    // Insight 3: High-risk files across projects
    const allHighRiskFiles = metrics.flatMap((m) => m.highRiskFiles);
    if (allHighRiskFiles.length > 0) {
      insights.push({
        id: 'high-risk-files',
        title: 'High-risk files require attention',
        projects: metrics.map((m) => m.name),
        type: 'risk',
        confidence: 0.8,
        recommendation: `${allHighRiskFiles.length} high-risk files identified. Prioritize refactoring in critical paths.`,
        createdAt: new Date().toISOString(),
      });
    }

    // Insight 4: Dependency-triggered optimization
    for (const dep of this.dependencies) {
      const sourceMetrics = this.sharedMetrics.projectMetrics.get(dep.source);
      const targetMetrics = this.sharedMetrics.projectMetrics.get(dep.target);

      if (sourceMetrics && targetMetrics && dep.type === 'api') {
        if (sourceMetrics.successRate < 0.9 && targetMetrics.successRate > 0.8) {
          insights.push({
            id: `dep-trigger-${dep.source}-${dep.target}`,
            title: `${dep.source} API changes may affect ${dep.target}`,
            projects: [dep.source, dep.target],
            type: 'dependency',
            confidence: 0.75,
            recommendation: `When ${dep.source} has API changes, automatically trigger ${dep.target} integration tests.`,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    this.insights = insights;
    return insights;
  }

  /**
   * Get cross-project metrics
   */
  getMetrics(): CrossProjectMetrics | null {
    return this.sharedMetrics;
  }

  /**
   * Get cross-project insights
   */
  getInsights(): CrossProjectInsight[] {
    return this.insights;
  }

  /**
   * Persist coordination state to disk
   */
  persist(): void {
    this.ensureDirectories();

    const data = {
      timestamp: new Date().toISOString(),
      projects: Array.from(this.projects.values()),
      dependencies: this.dependencies,
      metrics: this.sharedMetrics,
      insights: this.insights,
    };

    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ Multi-project coordination persisted to ${this.dataFile}`);
    } catch (error) {
      console.error('❌ Failed to persist coordination:', error);
    }
  }

  /**
   * Load coordination state from disk
   */
  load(): boolean {
    if (!fs.existsSync(this.dataFile)) {
      console.log('ℹ️  No existing coordination state found');
      return false;
    }

    try {
      const content = fs.readFileSync(this.dataFile, 'utf-8');
      const data = JSON.parse(content);

      // Restore projects
      for (const proj of data.projects) {
        this.projects.set(proj.name, proj);
      }

      // Restore dependencies
      this.dependencies = data.dependencies || [];

      // Restore metrics
      this.sharedMetrics = data.metrics;

      // Restore insights
      this.insights = data.insights || [];

      console.log(`✅ Coordination state loaded from ${this.dataFile}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load coordination:', error);
      return false;
    }
  }

  /**
   * Generate coordination report
   */
  generateReport(): string {
    let report = `# 🌐 Multi-Project Coordination Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    // Projects
    report += `## 📦 Registered Projects\n\n`;
    report += `| Project | Type | Status | Confidence | Runs |\n`;
    report += `|---------|------|--------|------------|------|\n`;
    for (const project of this.projects.values()) {
      report += `| ${project.name} | ${project.type} | ${project.isActive ? '✅' : '❌'} | ${(project.confidence * 100).toFixed(0)}% | ${project.totalRuns} |\n`;
    }
    report += '\n';

    // Dependencies
    if (this.dependencies.length > 0) {
      report += `## 🔗 Dependencies\n\n`;
      for (const dep of this.dependencies) {
        report += `- **${dep.source}** → **${dep.target}** (${dep.type}): ${dep.details}\n`;
      }
      report += '\n';
    }

    // Metrics
    if (this.sharedMetrics) {
      report += `## 📊 Aggregate Metrics\n\n`;
      report += `- **Total Runs:** ${this.sharedMetrics.totalRuns}\n`;
      report += `- **Average Confidence:** ${(this.sharedMetrics.averageConfidence * 100).toFixed(0)}%\n`;
      report += `- **Shared Patterns:** ${this.sharedMetrics.sharedPatterns.length}\n\n`;
    }

    // Shared Patterns
    if (this.sharedMetrics && this.sharedMetrics.sharedPatterns.length > 0) {
      report += `## 🎯 Shared Patterns\n\n`;
      for (const pattern of this.sharedMetrics.sharedPatterns.slice(0, 5)) {
        report += `- **${pattern.patternId}** (${pattern.impact}): Found in ${pattern.projects.join(', ')} (${pattern.frequency}x)\n`;
      }
      report += '\n';
    }

    // Insights
    if (this.insights.length > 0) {
      report += `## 💡 Cross-Project Insights\n\n`;
      for (const insight of this.insights.slice(0, 5)) {
        report += `- **${insight.title}** (${(insight.confidence * 100).toFixed(0)}%)\n`;
        report += `  ${insight.recommendation}\n\n`;
      }
    }

    return report;
  }
}

/**
 * Helper: Calculate project success rate
 */
function calculateProjectSuccessRate(state: LearningState): number {
  const agents = Array.from(state.agents.values());
  if (agents.length === 0) return 0;
  return agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length;
}

/**
 * Helper: Calculate average execution time
 */
function calculateAverageExecutionTime(state: LearningState): number {
  const agents = Array.from(state.agents.values());
  if (agents.length === 0) return 0;
  return agents.reduce((sum, a) => sum + a.averageDuration, 0) / agents.length;
}

/**
 * Helper: Get high-risk files
 */
function getHighRiskFiles(state: LearningState): string[] {
  return Array.from(state.fileRisks.entries())
    .filter(([_, profile]) => profile.riskScore > 0.6)
    .map(([file, _]) => file)
    .slice(0, 5);
}

/**
 * Global coordinator singleton
 */
let globalCoordinator: MultiProjectCoordinator | null = null;

/**
 * Get or create global coordinator
 */
export function getMultiProjectCoordinator(): MultiProjectCoordinator {
  if (!globalCoordinator) {
    globalCoordinator = new MultiProjectCoordinator();
  }
  return globalCoordinator;
}
