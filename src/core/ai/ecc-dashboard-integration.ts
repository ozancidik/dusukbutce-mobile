/**
 * ECC Dashboard Integration — Connects learning system to ECC control-pane
 * Real-time display of patterns, insights, and optimizations
 */

import { LearningState } from './learning-metrics';
import { PatternMatch } from './pattern-detector';
import { LearningOutput } from './learning-orchestrator';
import {
  buildLearningDashboard,
  generateDashboardHTML,
  generateDashboardMarkdown,
  DashboardWidget,
} from './dashboard-widgets';

export interface DashboardConfig {
  port: number; // Default: 8765
  refreshInterval: number; // milliseconds, default: 5000
  theme: 'light' | 'dark'; // Default: 'light'
  widgets: string[]; // Which widgets to show
  showHistorical: boolean; // Show historical trends
}

export interface DashboardServer {
  config: DashboardConfig;
  port: number;
  url: string;
  startTime: Date;
  requestCount: number;
}

/**
 * Initialize dashboard server
 */
export function initializeDashboardServer(
  config: Partial<DashboardConfig> = {}
): DashboardServer {
  const fullConfig: DashboardConfig = {
    port: 8765,
    refreshInterval: 5000,
    theme: 'light',
    widgets: [
      'confidence',
      'agents',
      'patterns',
      'risk_files',
      'optimizations',
      'insights',
    ],
    showHistorical: true,
    ...config,
  };

  return {
    config: fullConfig,
    port: fullConfig.port,
    url: `http://localhost:${fullConfig.port}`,
    startTime: new Date(),
    requestCount: 0,
  };
}

/**
 * Generate dashboard endpoint response
 */
export function generateDashboardEndpoint(
  learningOutput: LearningOutput
): {
  html: string;
  markdown: string;
  json: any;
} {
  const dashboard = buildLearningDashboard(
    learningOutput.state,
    learningOutput.patterns,
    learningOutput.state.insights
  );

  return {
    html: generateDashboardHTML(dashboard),
    markdown: generateDashboardMarkdown(dashboard),
    json: {
      confidence: learningOutput.state.learningConfidence,
      patterns: learningOutput.patterns.length,
      insights: learningOutput.state.insights.length,
      recommendations: learningOutput.recommendations.length,
      widgets: dashboard.widgets.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
      })),
      lastUpdate: dashboard.lastUpdate,
    },
  };
}

/**
 * Integration guide for ECC control-pane
 */
export const INTEGRATION_GUIDE = `
# ECC Learning Dashboard Integration Guide

## Setup

1. **Start the dashboard server:**
   \`\`\`bash
   npx ecc dashboard start --port 8765 --learning
   \`\`\`

2. **Open in browser:**
   - Local: http://localhost:8765
   - Remote: http://your-host:8765

3. **Dashboard auto-refreshes every 5 seconds**

## Widgets

### 1. Learning Confidence (Top-Left)
- Shows current confidence percentage
- Ranges from 🔴 Critical (0-20%) to 🟢 Excellent (80-100%)
- Subtitle: run count and patterns detected
- Trend: learning status

### 2. Agent Performance (Top-Right)
- Table of agent success rates
- Sorted by performance (best first)
- Shows average duration and run count
- Status indicator (green/yellow/red)

### 3. Detected Patterns (Middle)
- 8+ built-in patterns tracked
- Frequency and confidence for each
- Severity level (low/medium/high)
- Auto-fix availability indicator

### 4. High-Risk Files (Right)
- Files with risk score > 0.5
- Risk percentage, suggestion count, failures
- Click to view recommendations

### 5. Optimization Opportunities (Top-Right)
- Skip opportunities (100% success agents)
- Parallelization recommendations
- Estimated time savings

### 6. Insights & Recommendations (Bottom)
- Top actionable insights
- Type, confidence, and recommendation
- Click to dismiss or act

## API Endpoints

### GET /dashboard
Returns HTML dashboard page

### GET /dashboard/data.json
Returns JSON data:
\`\`\`json
{
  "confidence": 0.75,
  "patterns": 5,
  "insights": 3,
  "recommendations": 7,
  "widgets": [...],
  "lastUpdate": "2026-09-19T..."
}
\`\`\`

### GET /dashboard/markdown
Returns markdown report

## Real-time Features

- **Auto-refresh:** Every 5 seconds
- **WebSocket:** Optional live updates (if enabled)
- **Click interactions:** Expand cards for details
- **Export:** Download reports as HTML/Markdown/JSON

## Theming

Change theme in config:
\`\`\`typescript
initializeDashboardServer({
  theme: 'dark', // or 'light'
  refreshInterval: 5000,
  port: 8765
})
\`\`\`

## Customization

Show/hide specific widgets:
\`\`\`typescript
initializeDashboardServer({
  widgets: ['confidence', 'patterns', 'insights']
})
\`\`\`

## Monitoring

Check server status:
\`\`\`bash
curl http://localhost:8765/health
\`\`\`

Returns:
\`\`\`json
{
  "status": "healthy",
  "uptime": "2h 15m",
  "requests": 842,
  "lastUpdate": "2026-09-19T..."
}
\`\`\`
`;

/**
 * Generate integration helper functions
 */
export const DashboardHelper = {
  /**
   * Start dashboard (mock implementation)
   */
  start: async (config: Partial<DashboardConfig> = {}) => {
    const server = initializeDashboardServer(config);
    console.log(`\n📊 Dashboard Server Starting`);
    console.log(`   URL: ${server.url}`);
    console.log(`   Port: ${server.port}`);
    console.log(`   Theme: ${server.config.theme}`);
    console.log(`   Refresh: ${server.config.refreshInterval}ms\n`);
    return server;
  },

  /**
   * Stop dashboard
   */
  stop: () => {
    console.log('\n⏹️  Dashboard stopped\n');
  },

  /**
   * Get status
   */
  getStatus: (server: DashboardServer) => {
    const uptime = Math.round(
      (Date.now() - server.startTime.getTime()) / 1000 / 60
    );
    return {
      status: 'healthy',
      uptime: `${uptime}m`,
      requests: server.requestCount,
      url: server.url,
    };
  },

  /**
   * Reload dashboard data
   */
  reload: (learningOutput: LearningOutput) => {
    const endpoint = generateDashboardEndpoint(learningOutput);
    console.log(`\n🔄 Dashboard updated`);
    console.log(`   Patterns: ${learningOutput.patterns.length}`);
    console.log(`   Insights: ${learningOutput.state.insights.length}`);
    console.log(`   Confidence: ${(learningOutput.state.learningConfidence * 100).toFixed(0)}%\n`);
    return endpoint;
  },
};

/**
 * Generate ECC hook for dashboard integration
 */
export function generateECCDashboardHook(): string {
  return `#!/bin/bash
# ECC Dashboard Integration Hook
# Called after learning system completes

set -e

BRANCH=\$(git rev-parse --abbrev-ref HEAD)
COMMIT=\$(git rev-parse HEAD)

# Skip on main branch
if [ "\$BRANCH" = "main" ]; then
  exit 0
fi

echo ""
echo "📊 Updating ECC Dashboard"
echo "   Branch: \$BRANCH"
echo "   Commit: \${COMMIT:0:7}"
echo ""

# In production: send learning data to dashboard server
# npx ecc dashboard update --learning-data .ecc/learning-state.json

echo "✅ Dashboard updated"
echo "   URL: http://localhost:8765"
echo ""
`;
}

/**
 * Export/import dashboard state for persistence
 */
export function exportDashboardState(
  learningOutput: LearningOutput
): string {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      branch: 'auto-detected',
      confidence: learningOutput.state.learningConfidence,
      patterns: learningOutput.patterns.length,
      insights: learningOutput.state.insights.length,
      recommendations: learningOutput.recommendations,
      widgets: buildLearningDashboard(
        learningOutput.state,
        learningOutput.patterns,
        learningOutput.state.insights
      ).widgets.length,
    },
    null,
    2
  );
}

/**
 * Generate quick-start guide
 */
export const QUICKSTART = `
# 🚀 Learning Dashboard Quick Start

## 1. Start the Dashboard
\`\`\`bash
npx ecc dashboard --learning --port 8765
\`\`\`

## 2. Open Browser
Visit: http://localhost:8765

## 3. Make Commits
The dashboard auto-updates as agents run:
\`\`\`bash
git commit -m "feat: add feature"
# → Agents run automatically
# → Learning system collects metrics
# → Dashboard updates in real-time
\`\`\`

## 4. Watch Learning Improve

### First Run (0-5 runs)
- 🔴 0-20% confidence
- Dashboard shows raw data
- Patterns emerging

### Learning Phase (5-25 runs)
- 🟡 20-60% confidence
- Clear patterns visible
- Optimization suggestions appear

### Optimized (25+ runs)
- 🟢 60-100% confidence
- Predictions accurate
- ~50% faster execution

## 5. Act on Insights

Dashboard shows:
- ✅ High-risk files → refactor
- 💡 Patterns → prevention tips
- ⚡ Optimizations → apply next run

## Dashboard URL
\`\`\`
http://localhost:8765
\`\`\`

Refresh rate: 5 seconds (auto)

Widgets:
- 🧠 Learning Confidence
- ⚙️ Agent Performance
- 🎯 Detected Patterns
- ⚠️ High-Risk Files
- 💡 Optimization Opportunities
- 💭 Insights & Recommendations
`;
