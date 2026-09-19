/**
 * Performance Monitor — Track system health and detect regressions
 * Monitors CPU, memory, execution times, and trends
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Performance baseline
 */
export interface PerformanceBaseline {
  metric: string;
  targetMs: number;
  budgetMs: number;
  warningMs: number;
  description: string;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  timestamp: string;
  metric: string;
  value: number;
  unit: 'ms' | 'mb' | 'percent';
  status: 'healthy' | 'warning' | 'critical';
  baseline?: number;
  deviation?: number;
}

/**
 * Performance health check
 */
export interface HealthCheck {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  status: 'healthy' | 'degraded' | 'critical';
  alerts: string[];
}

/**
 * Performance report
 */
export interface PerformanceReport {
  timestamp: string;
  period: 'last_1h' | 'last_24h' | 'last_7d';
  metrics: PerformanceMetric[];
  healthChecks: HealthCheck[];
  regressions: Array<{
    metric: string;
    baseline: number;
    current: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private healthChecks: HealthCheck[] = [];
  private baselines: Map<string, PerformanceBaseline>;
  private eccDir: string;
  private dataFile: string;
  private maxMetrics: number = 10000;

  constructor() {
    this.eccDir = path.join(process.env.HOME || '~', '.ecc', 'performance');
    this.dataFile = path.join(this.eccDir, 'metrics.json');
    this.ensureDirectories();
    this.baselines = this.initializeBaselines();
  }

  /**
   * Ensure directories exist
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.eccDir)) {
      fs.mkdirSync(this.eccDir, { recursive: true });
    }
  }

  /**
   * Initialize performance baselines
   */
  private initializeBaselines(): Map<string, PerformanceBaseline> {
    return new Map([
      [
        'total_execution_time',
        {
          metric: 'total_execution_time',
          targetMs: 8500,
          budgetMs: 10000,
          warningMs: 9500,
          description: 'Total agent orchestration time',
        },
      ],
      [
        'agent_execution_time',
        {
          metric: 'agent_execution_time',
          targetMs: 2000,
          budgetMs: 5000,
          warningMs: 3500,
          description: 'Individual agent execution time',
        },
      ],
      [
        'memory_usage',
        {
          metric: 'memory_usage',
          targetMs: 256,
          budgetMs: 512,
          warningMs: 384,
          description: 'Memory consumption (MB)',
        },
      ],
      [
        'cpu_usage',
        {
          metric: 'cpu_usage',
          targetMs: 50,
          budgetMs: 80,
          warningMs: 65,
          description: 'CPU usage percentage',
        },
      ],
    ]);
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    metric: string,
    value: number,
    unit: 'ms' | 'mb' | 'percent'
  ): void {
    const baseline = this.baselines.get(metric);
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let deviation = 0;

    if (baseline) {
      if (value > baseline.budgetMs) {
        status = 'critical';
      } else if (value > baseline.warningMs) {
        status = 'warning';
      }
      deviation = ((value - baseline.targetMs) / baseline.targetMs) * 100;
    }

    const performanceMetric: PerformanceMetric = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      status,
      baseline: baseline?.targetMs,
      deviation,
    };

    this.metrics.push(performanceMetric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    if (status !== 'healthy') {
      console.warn(`⚠️  Performance ${status}: ${metric} = ${value}${unit}`);
    }
  }

  /**
   * Perform system health check
   */
  performHealthCheck(): HealthCheck {
    const cpuUsage = os.loadavg()[0] * 10; // Rough estimation
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    const uptime = process.uptime();

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const alerts: string[] = [];

    if (cpuUsage > 80) {
      status = 'critical';
      alerts.push(`CPU usage critical: ${cpuUsage.toFixed(0)}%`);
    } else if (cpuUsage > 65) {
      status = 'degraded';
      alerts.push(`CPU usage high: ${cpuUsage.toFixed(0)}%`);
    }

    if (memoryUsage > 80) {
      status = 'critical';
      alerts.push(`Memory usage critical: ${memoryUsage.toFixed(0)}%`);
    } else if (memoryUsage > 65) {
      status = 'degraded';
      alerts.push(`Memory usage high: ${memoryUsage.toFixed(0)}%`);
    }

    const healthCheck: HealthCheck = {
      timestamp: new Date().toISOString(),
      cpuUsage,
      memoryUsage,
      uptime,
      status,
      alerts,
    };

    this.healthChecks.push(healthCheck);

    if (this.healthChecks.length > 1000) {
      this.healthChecks = this.healthChecks.slice(-1000);
    }

    return healthCheck;
  }

  /**
   * Detect performance regressions
   */
  detectRegressions(): Array<{
    metric: string;
    baseline: number;
    current: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const regressions: Array<{
      metric: string;
      baseline: number;
      current: number;
      deviation: number;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    // Group metrics by type
    const metricsByType = new Map<string, PerformanceMetric[]>();
    for (const metric of this.metrics.slice(-100)) {
      if (!metricsByType.has(metric.metric)) {
        metricsByType.set(metric.metric, []);
      }
      metricsByType.get(metric.metric)!.push(metric);
    }

    // Analyze trends
    for (const [metricName, metrics] of metricsByType) {
      if (metrics.length < 5) continue;

      const baseline = this.baselines.get(metricName);
      if (!baseline) continue;

      const avg = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      const deviation = ((avg - baseline.targetMs) / baseline.targetMs) * 100;

      if (Math.abs(deviation) > 20) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (deviation > 40) severity = 'high';
        else if (deviation > 25) severity = 'medium';

        regressions.push({
          metric: metricName,
          baseline: baseline.targetMs,
          current: avg,
          deviation,
          severity,
        });
      }
    }

    return regressions;
  }

  /**
   * Generate performance report
   */
  generateReport(
    period: 'last_1h' | 'last_24h' | 'last_7d' = 'last_1h'
  ): PerformanceReport {
    const now = new Date();
    let cutoff: Date;

    switch (period) {
      case 'last_1h':
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'last_24h':
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const recentMetrics = this.metrics.filter(
      (m) => new Date(m.timestamp) > cutoff
    );

    const recentChecks = this.healthChecks.filter(
      (h) => new Date(h.timestamp) > cutoff
    );

    const regressions = this.detectRegressions();
    const recommendations = this.generateRecommendations(regressions, recentChecks);

    return {
      timestamp: new Date().toISOString(),
      period,
      metrics: recentMetrics,
      healthChecks: recentChecks,
      regressions,
      recommendations,
    };
  }

  /**
   * Generate recommendations from data
   */
  private generateRecommendations(
    regressions: any[],
    healthChecks: HealthCheck[]
  ): string[] {
    const recommendations: string[] = [];

    if (regressions.length > 0) {
      const highSeverity = regressions.filter((r) => r.severity === 'high');
      if (highSeverity.length > 0) {
        recommendations.push(
          `🔴 HIGH: ${highSeverity.map((r) => r.metric).join(', ')} regressed significantly`
        );
      }
    }

    const criticalChecks = healthChecks.filter((h) => h.status === 'critical');
    if (criticalChecks.length > 0) {
      const lastAlert = criticalChecks[criticalChecks.length - 1];
      recommendations.push(`🚨 CRITICAL: ${lastAlert.alerts.join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System performance healthy - no issues detected');
    }

    return recommendations;
  }

  /**
   * Get current performance summary
   */
  getSummary(): {
    metricsCount: number;
    healthChecksCount: number;
    averageExecutionTime: number;
    averageCpuUsage: number;
    averageMemoryUsage: number;
    status: 'healthy' | 'degraded' | 'critical';
  } {
    const lastMetrics = this.metrics.slice(-100);
    const lastChecks = this.healthChecks.slice(-100);

    const avgExecution =
      lastMetrics.length > 0
        ? lastMetrics.reduce((sum, m) => sum + m.value, 0) / lastMetrics.length
        : 0;

    const avgCpu =
      lastChecks.length > 0
        ? lastChecks.reduce((sum, c) => sum + c.cpuUsage, 0) / lastChecks.length
        : 0;

    const avgMem =
      lastChecks.length > 0
        ? lastChecks.reduce((sum, c) => sum + c.memoryUsage, 0) / lastChecks.length
        : 0;

    const status = lastChecks.length > 0 ? lastChecks[lastChecks.length - 1].status : 'healthy';

    return {
      metricsCount: this.metrics.length,
      healthChecksCount: this.healthChecks.length,
      averageExecutionTime: avgExecution,
      averageCpuUsage: avgCpu,
      averageMemoryUsage: avgMem,
      status,
    };
  }

  /**
   * Persist performance data
   */
  persist(): void {
    this.ensureDirectories();

    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics.slice(-1000),
      healthChecks: this.healthChecks.slice(-1000),
      baselines: Array.from(this.baselines.values()),
    };

    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to persist performance data:', error);
    }
  }

  /**
   * Load performance data
   */
  load(): boolean {
    if (!fs.existsSync(this.dataFile)) {
      return false;
    }

    try {
      const content = fs.readFileSync(this.dataFile, 'utf-8');
      const data = JSON.parse(content);
      this.metrics = data.metrics || [];
      this.healthChecks = data.healthChecks || [];
      return true;
    } catch (error) {
      console.error('Failed to load performance data:', error);
      return false;
    }
  }

  /**
   * Export as markdown
   */
  exportMarkdown(): string {
    const report = this.generateReport('last_1h');
    let markdown = `# ⏱️ Performance Report\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n`;
    markdown += `**Period:** Last 1 hour\n\n`;

    markdown += `## Summary\n\n`;
    const summary = this.getSummary();
    markdown += `- **Status:** ${summary.status.toUpperCase()}\n`;
    markdown += `- **Avg Execution:** ${summary.averageExecutionTime.toFixed(0)}ms\n`;
    markdown += `- **Avg CPU:** ${summary.averageCpuUsage.toFixed(0)}%\n`;
    markdown += `- **Avg Memory:** ${summary.averageMemoryUsage.toFixed(0)}%\n\n`;

    if (report.regressions.length > 0) {
      markdown += `## Regressions Detected\n\n`;
      for (const reg of report.regressions) {
        markdown += `- **${reg.metric}** (${reg.severity})\n`;
        markdown += `  Baseline: ${reg.baseline}ms → Current: ${reg.current.toFixed(0)}ms\n`;
      }
      markdown += '\n';
    }

    markdown += `## Recommendations\n\n`;
    for (const rec of report.recommendations) {
      markdown += `- ${rec}\n`;
    }

    return markdown;
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global monitor
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}
