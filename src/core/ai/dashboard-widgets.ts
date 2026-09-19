/**
 * Dashboard Widgets — Visual components for ECC control-pane integration
 * Displays learning insights, patterns, and recommendations in real-time
 */

import { LearningState, LearningInsight } from './learning-metrics';
import { PatternMatch } from './pattern-detector';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'list' | 'alert';
  data: any;
  refreshInterval?: number; // milliseconds
  layout: { x: number; y: number; w: number; h: number }; // grid position
}

export interface LearningDashboard {
  widgets: DashboardWidget[];
  lastUpdate: Date;
  confidence: number; // 0-1
  readyForOptimization: boolean;
}

/**
 * Create learning confidence widget
 */
export function createConfidenceWidget(state: LearningState): DashboardWidget {
  const percentage = Math.round(state.learningConfidence * 100);
  const status = getConfidenceStatus(percentage);
  const color = getStatusColor(status);

  return {
    id: 'widget_confidence',
    title: '🧠 Learning Confidence',
    type: 'stat',
    data: {
      value: `${percentage}%`,
      status,
      color,
      subtitle: `${state.totalRuns} runs, ${state.patterns.size} patterns detected`,
      trend:
        percentage > 50
          ? '📈 High confidence — optimizations active'
          : '📊 Learning — collecting data',
    },
    layout: { x: 0, y: 0, w: 3, h: 2 },
  };
}

/**
 * Create agent performance widget
 */
export function createAgentPerformanceWidget(
  state: LearningState
): DashboardWidget {
  const agents = Array.from(state.agents.entries())
    .sort((a, b) => b[1].successRate - a[1].successRate)
    .slice(0, 5)
    .map(([name, metrics]) => ({
      name,
      successRate: `${(metrics.successRate * 100).toFixed(0)}%`,
      duration: `${metrics.averageDuration.toFixed(0)}ms`,
      runs: metrics.runCount,
      status: metrics.successRate > 0.9 ? '🟢' : metrics.successRate > 0.75 ? '🟡' : '🔴',
    }));

  return {
    id: 'widget_agents',
    title: '⚙️ Agent Performance',
    type: 'table',
    data: {
      headers: ['Agent', 'Success', 'Avg Time', 'Runs', ''],
      rows: agents.map((a) => [a.name, a.successRate, a.duration, a.runs, a.status]),
    },
    layout: { x: 3, y: 0, w: 4, h: 2 },
  };
}

/**
 * Create patterns widget
 */
export function createPatternsWidget(
  patterns: PatternMatch[]
): DashboardWidget {
  const topPatterns = patterns.slice(0, 8).map((m) => ({
    name: m.pattern.name,
    frequency: m.pattern.frequency,
    confidence: `${(m.confidence * 100).toFixed(0)}%`,
    severity: m.pattern.severity.toUpperCase(),
    autoFix: m.pattern.autoFixAvailable ? '✓' : '✗',
  }));

  return {
    id: 'widget_patterns',
    title: '🎯 Detected Patterns',
    type: 'table',
    data: {
      headers: ['Pattern', 'Freq', 'Confidence', 'Severity', 'Auto-Fix'],
      rows: topPatterns.map((p) => [
        p.name,
        p.frequency,
        p.confidence,
        `[${p.severity}]`,
        p.autoFix,
      ]),
    },
    layout: { x: 0, y: 2, w: 7, h: 3 },
  };
}

/**
 * Create high-risk files widget
 */
export function createHighRiskFilesWidget(
  state: LearningState
): DashboardWidget {
  const riskFiles = Array.from(state.fileRisks.entries())
    .filter(([_, profile]) => profile.riskScore > 0.5)
    .sort((a, b) => b[1].riskScore - a[1].riskScore)
    .slice(0, 5)
    .map(([file, profile]) => ({
      file: file.split('/').pop() || file,
      fullPath: file,
      risk: `${(profile.riskScore * 100).toFixed(0)}%`,
      suggestions: profile.totalSuggestions,
      failures: profile.failureCount,
      status: profile.riskScore > 0.8 ? '🔴' : '🟡',
    }));

  return {
    id: 'widget_risk_files',
    title: '⚠️ High-Risk Files',
    type: 'table',
    data: {
      headers: ['File', 'Risk', 'Suggestions', 'Failures', ''],
      rows: riskFiles.map((f) => [
        f.file,
        f.risk,
        f.suggestions,
        f.failures,
        f.status,
      ]),
    },
    layout: { x: 7, y: 2, w: 4, h: 3 },
  };
}

/**
 * Create optimization opportunities widget
 */
export function createOptimizationWidget(state: LearningState): DashboardWidget {
  const optimizations = [];

  // Skip opportunities
  let skipCount = 0;
  for (const [name, metrics] of state.agents) {
    if (metrics.successRate === 1 && metrics.runCount > 3) {
      skipCount++;
      optimizations.push({
        type: '⚡',
        action: `Skip ${name}`,
        benefit: 'Avg time saved',
        impact: `${metrics.averageDuration.toFixed(0)}ms`,
      });
    }
  }

  // Parallel opportunities
  const fastAgents = Array.from(state.agents.entries())
    .filter(([_, m]) => m.averageDuration < 5000)
    .map(([name, _]) => name);

  if (fastAgents.length > 1) {
    optimizations.push({
      type: '🔄',
      action: `Parallelize ${fastAgents.length} agents`,
      benefit: 'Execution time',
      impact: '~30-50% faster',
    });
  }

  return {
    id: 'widget_optimizations',
    title: '💡 Optimization Opportunities',
    type: 'list',
    data: {
      items: optimizations.slice(0, 5).map(
        (o) => `${o.type} ${o.action} — ${o.benefit}: ${o.impact}`
      ),
    },
    layout: { x: 7, y: 0, w: 4, h: 2 },
  };
}

/**
 * Create insights widget
 */
export function createInsightsWidget(
  insights: LearningInsight[]
): DashboardWidget {
  const actionableInsights = insights
    .filter((i) => i.actionable)
    .slice(0, 5)
    .map((i) => ({
      title: i.title,
      type: i.type.toUpperCase(),
      confidence: `${(i.confidence * 100).toFixed(0)}%`,
      recommendation: i.recommendation || '',
    }));

  return {
    id: 'widget_insights',
    title: '💡 Insights & Recommendations',
    type: 'list',
    data: {
      items: actionableInsights.map(
        (i) =>
          `[${i.type} • ${i.confidence}] ${i.title}${i.recommendation ? ` — ${i.recommendation}` : ''}`
      ),
    },
    layout: { x: 0, y: 5, w: 11, h: 2 },
  };
}

/**
 * Build complete learning dashboard
 */
export function buildLearningDashboard(
  state: LearningState,
  patterns: PatternMatch[],
  insights: LearningInsight[]
): LearningDashboard {
  const widgets: DashboardWidget[] = [
    createConfidenceWidget(state),
    createAgentPerformanceWidget(state),
    createPatternsWidget(patterns),
    createHighRiskFilesWidget(state),
    createOptimizationWidget(state),
    createInsightsWidget(insights),
  ];

  return {
    widgets,
    lastUpdate: new Date(),
    confidence: state.learningConfidence,
    readyForOptimization: state.totalRuns > 10 && state.learningConfidence > 0.6,
  };
}

/**
 * Generate dashboard HTML
 */
export function generateDashboardHTML(dashboard: LearningDashboard): string {
  const confidenceColor = getStatusColor(
    getConfidenceStatus(Math.round(dashboard.confidence * 100))
  );

  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>ECC Learning Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .header h1 { color: #2c3e50; margin-bottom: 10px; }
    .header-meta { display: flex; gap: 20px; font-size: 14px; color: #7f8c8d; }
    .dashboard {
      display: grid;
      grid-template-columns: repeat(11, 1fr);
      gap: 20px;
    }
    .widget {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      grid-column: span var(--span-x);
      grid-row: span var(--span-y);
      display: flex;
      flex-direction: column;
    }
    .widget h2 { font-size: 16px; margin-bottom: 15px; color: #2c3e50; }
    .stat-value { font-size: 32px; font-weight: bold; color: ${confidenceColor}; }
    .stat-meta { font-size: 12px; color: #7f8c8d; margin-top: 8px; }
    .stat-trend { font-size: 13px; color: #2ecc71; margin-top: 8px; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { background: #ecf0f1; padding: 10px; text-align: left; font-weight: 600; color: #2c3e50; }
    .table td { padding: 10px; border-bottom: 1px solid #ecf0f1; }
    .table tr:hover { background: #f9f9f9; }
    .list { list-style: none; }
    .list li { padding: 10px; border-left: 3px solid #3498db; margin-bottom: 8px; background: #f9f9f9; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; }
    .alert.error { background: #f8d7da; border-left: 4px solid #dc3545; }
    .alert.success { background: #d4edda; border-left: 4px solid #28a745; }
    @media (max-width: 1024px) {
      .dashboard { grid-template-columns: repeat(6, 1fr); }
      .widget { --span-x: min(var(--span-x), 6) !important; }
    }
    @media (max-width: 768px) {
      .dashboard { grid-template-columns: 1fr; }
      .widget { --span-x: 1 !important; --span-y: auto !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 ECC Learning Dashboard</h1>
    <div class="header-meta">
      <span>Last Update: ${dashboard.lastUpdate.toLocaleTimeString()}</span>
      <span>Confidence: ${(dashboard.confidence * 100).toFixed(0)}%</span>
      <span>${dashboard.readyForOptimization ? '✅ Ready for optimization' : '📊 Still learning'}</span>
    </div>
  </div>

  <div class="dashboard">
`;

  for (const widget of dashboard.widgets) {
    const spanX = widget.layout.w;
    const spanY = widget.layout.h;

    html += `
    <div class="widget" style="--span-x: ${spanX}; --span-y: ${spanY}">
      <h2>${widget.title}</h2>
      ${renderWidgetContent(widget)}
    </div>
`;
  }

  html += `
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);

    // Interactive click handlers would go here
    document.querySelectorAll('.widget').forEach(w => {
      w.addEventListener('click', () => console.log('Widget clicked:', w.querySelector('h2').textContent));
    });
  </script>
</body>
</html>
`;

  return html;
}

/**
 * Render widget content based on type
 */
function renderWidgetContent(widget: DashboardWidget): string {
  switch (widget.type) {
    case 'stat':
      return `
        <div class="stat-value">${widget.data.value}</div>
        <div class="stat-meta">${widget.data.subtitle}</div>
        <div class="stat-trend">${widget.data.trend}</div>
      `;

    case 'table':
      return `
        <table class="table">
          <thead>
            <tr>${widget.data.headers.map((h: string) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${widget.data.rows
              .map((row: any[]) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>
      `;

    case 'list':
      return `
        <ul class="list">
          ${widget.data.items.map((item: string) => `<li>${item}</li>`).join('')}
        </ul>
      `;

    case 'chart':
      return '<div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #bdc3c7;">Chart placeholder</div>';

    case 'alert':
      return `<div class="alert">${widget.data.message}</div>`;

    default:
      return `<div>${JSON.stringify(widget.data)}</div>`;
  }
}

/**
 * Get confidence status label
 */
function getConfidenceStatus(
  percentage: number
): 'critical' | 'warning' | 'good' | 'excellent' {
  if (percentage < 20) return 'critical';
  if (percentage < 50) return 'warning';
  if (percentage < 80) return 'good';
  return 'excellent';
}

/**
 * Get color for status
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    critical: '#e74c3c',
    warning: '#f39c12',
    good: '#3498db',
    excellent: '#2ecc71',
  };
  return colors[status] || '#95a5a6';
}

/**
 * Generate dashboard markdown
 */
export function generateDashboardMarkdown(
  dashboard: LearningDashboard
): string {
  return `
# 🧠 Learning Dashboard

**Last Update:** ${dashboard.lastUpdate.toLocaleTimeString()}
**Confidence:** ${(dashboard.confidence * 100).toFixed(0)}%
**Status:** ${dashboard.readyForOptimization ? '✅ Ready for optimization' : '📊 Still learning'}

## Widgets

${dashboard.widgets.map((w) => `### ${w.title}\n\n[Widget: ${w.type}]`).join('\n\n')}

---
*Auto-refresh every 30 seconds*
`;
}
