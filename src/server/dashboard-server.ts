/**
 * Cloud Dashboard Server — Real-time learning visualization
 * Hosts learning dashboard on Express.js with WebSocket updates
 */

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import * as fs from 'fs';
import { LearningState } from '../core/ai/learning-metrics';
import { PatternMatch } from '../core/ai/pattern-detector';
import {
  buildLearningDashboard,
  generateDashboardHTML,
  generateDashboardMarkdown,
} from '../core/ai/dashboard-widgets';
import { getMultiProjectCoordinator } from '../core/ai/multi-project-coordinator';
import { getPerformanceMonitor } from '../core/ai/performance-monitor';

/**
 * Dashboard server configuration
 */
export interface DashboardServerConfig {
  port: number;
  host: string;
  refreshInterval: number;
  theme: 'light' | 'dark';
  maxClients: number;
  dataDir: string;
}

/**
 * Dashboard update payload
 */
interface DashboardUpdate {
  type: 'state-update' | 'pattern-update' | 'insight-update' | 'coordinator-update';
  timestamp: string;
  data: any;
}

/**
 * Cloud Dashboard Server
 */
export class CloudDashboardServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;
  private config: DashboardServerConfig;
  private currentState: LearningState | null = null;
  private currentPatterns: PatternMatch[] = [];
  private updateHistory: Array<{ timestamp: string; update: DashboardUpdate }> = [];
  private maxHistory: number = 1000;

  constructor(config: Partial<DashboardServerConfig> = {}) {
    this.config = {
      port: 8765,
      host: 'localhost',
      refreshInterval: 5000,
      theme: 'light',
      maxClients: 50,
      dataDir: path.join(process.env.HOME || '~', '.ecc', 'dashboard'),
      ...config,
    };

    this.ensureDataDir();
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // Dashboard HTML page
    this.app.get('/', (req, res) => {
      if (!this.currentState || !this.currentPatterns) {
        res.send(this.generateEmptyDashboardHTML());
        return;
      }

      const dashboard = buildLearningDashboard(
        this.currentState,
        this.currentPatterns,
        this.currentState.insights
      );

      const html = generateDashboardHTML(dashboard);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });

    // API: Get current state (JSON)
    this.app.get('/api/state', (req, res) => {
      if (!this.currentState) {
        return res.status(404).json({ error: 'No state available' });
      }

      res.json({
        confidence: this.currentState.learningConfidence,
        totalRuns: this.currentState.totalRuns,
        patterns: this.currentPatterns.length,
        insights: this.currentState.insights.length,
        timestamp: new Date().toISOString(),
      });
    });

    // API: Get patterns
    this.app.get('/api/patterns', (req, res) => {
      res.json(
        this.currentPatterns.map((p) => ({
          id: p.pattern.name.toLowerCase().replace(/\s+/g, '-'),
          name: p.pattern.name,
          frequency: p.pattern.frequency,
          confidence: p.confidence,
          severity: p.pattern.severity,
          autoFix: p.pattern.autoFixAvailable,
        }))
      );
    });

    // API: Get metrics
    this.app.get('/api/metrics', (req, res) => {
      if (!this.currentState) {
        return res.status(404).json({ error: 'No state available' });
      }

      const agents = Array.from(this.currentState.agents.entries()).map(
        ([name, metrics]) => ({
          name,
          successRate: metrics.successRate,
          averageDuration: metrics.averageDuration,
          runCount: metrics.runCount,
        })
      );

      res.json({
        agents,
        timestamp: new Date().toISOString(),
      });
    });

    // API: Get insights
    this.app.get('/api/insights', (req, res) => {
      if (!this.currentState) {
        return res.status(404).json({ error: 'No state available' });
      }

      res.json(
        this.currentState.insights.map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          confidence: i.confidence,
          actionable: i.actionable,
          recommendation: i.recommendation,
        }))
      );
    });

    // API: Get multi-project coordination
    this.app.get('/api/coordination', (req, res) => {
      const coordinator = getMultiProjectCoordinator();
      const metrics = coordinator.getMetrics();
      const insights = coordinator.getInsights();

      res.json({
        projects: coordinator.getProjects().map((p) => ({
          name: p.name,
          type: p.type,
          confidence: p.confidence,
          runs: p.totalRuns,
        })),
        metrics: {
          totalRuns: metrics?.totalRuns || 0,
          averageConfidence: metrics?.averageConfidence || 0,
          sharedPatterns: metrics?.sharedPatterns.length || 0,
        },
        insights: insights.map((i) => ({
          id: i.id,
          title: i.title,
          projects: i.projects,
          type: i.type,
          confidence: i.confidence,
        })),
        timestamp: new Date().toISOString(),
      });
    });

    // API: Export dashboard as markdown
    this.app.get('/api/export/markdown', (req, res) => {
      if (!this.currentState) {
        return res.status(404).json({ error: 'No state available' });
      }

      const dashboard = buildLearningDashboard(
        this.currentState,
        this.currentPatterns,
        this.currentState.insights
      );

      const markdown = generateDashboardMarkdown(dashboard);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard.md"');
      res.send(markdown);
    });

    // API: Export dashboard as JSON
    this.app.get('/api/export/json', (req, res) => {
      if (!this.currentState) {
        return res.status(404).json({ error: 'No state available' });
      }

      const data = {
        timestamp: new Date().toISOString(),
        state: {
          confidence: this.currentState.learningConfidence,
          totalRuns: this.currentState.totalRuns,
          agents: Array.from(this.currentState.agents.entries()),
          patterns: this.currentPatterns,
          insights: this.currentState.insights,
        },
        coordination: {
          coordinator: getMultiProjectCoordinator().getMetrics(),
          insights: getMultiProjectCoordinator().getInsights(),
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard.json"');
      res.json(data);
    });

    // API: Update state (POST)
    this.app.post('/api/update', (req, res) => {
      const { state, patterns } = req.body;

      if (!state) {
        return res.status(400).json({ error: 'Missing state' });
      }

      this.currentState = state;
      this.currentPatterns = patterns || [];

      this.recordUpdate({
        type: 'state-update',
        timestamp: new Date().toISOString(),
        data: { confidence: state.learningConfidence, runs: state.totalRuns },
      });

      this.broadcastUpdate({
        type: 'state-update',
        timestamp: new Date().toISOString(),
        data: { confidence: state.learningConfidence, runs: state.totalRuns },
      });

      res.json({ success: true, timestamp: new Date().toISOString() });
    });

    // API: Get performance metrics
    this.app.get('/api/performance', (req, res) => {
      const monitor = getPerformanceMonitor();
      const summary = monitor.getSummary();

      res.json({
        summary,
        timestamp: new Date().toISOString(),
      });
    });

    // API: Get performance report
    this.app.get('/api/performance/report', (req, res) => {
      const period = (req.query.period as string) || 'last_1h';
      const monitor = getPerformanceMonitor();
      const report = monitor.generateReport(period as any);

      res.json(report);
    });

    // Health check
    this.app.get('/health', (req, res) => {
      const monitor = getPerformanceMonitor();
      const perfSummary = monitor.getSummary();

      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        clients: this.wss.clients.size,
        performance: perfSummary.status,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Setup WebSocket for real-time updates
   */
  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket.WebSocket) => {
      console.log(`📱 WebSocket client connected (${this.wss.clients.size} clients)`);

      // Send current state on connect
      if (this.currentState) {
        ws.send(
          JSON.stringify({
            type: 'initial-state',
            data: {
              confidence: this.currentState.learningConfidence,
              runs: this.currentState.totalRuns,
              patterns: this.currentPatterns.length,
            },
          })
        );
      }

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          console.log(`📬 WebSocket message:`, data.type);

          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          }
        } catch (error) {
          console.error('WebSocket error:', error);
        }
      });

      ws.on('close', () => {
        console.log(`📴 WebSocket client disconnected (${this.wss.clients.size} clients)`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  /**
   * Record update in history
   */
  private recordUpdate(update: DashboardUpdate): void {
    this.updateHistory.push({
      timestamp: new Date().toISOString(),
      update,
    });

    // Keep only last N updates
    if (this.updateHistory.length > this.maxHistory) {
      this.updateHistory = this.updateHistory.slice(-this.maxHistory);
    }
  }

  /**
   * Broadcast update to all WebSocket clients
   */
  private broadcastUpdate(update: DashboardUpdate): void {
    const message = JSON.stringify(update);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Generate empty dashboard HTML
   */
  private generateEmptyDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>ECC Learning Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
    }
    h1 { color: #333; margin: 0 0 10px 0; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 ECC Learning Dashboard</h1>
    <p>Waiting for learning data...</p>
    <p style="font-size: 12px; color: #999;">Auto-refresh every 5 seconds</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`\n📊 Dashboard Server Started`);
        console.log(`   URL: http://${this.config.host}:${this.config.port}`);
        console.log(`   WebSocket: ws://${this.config.host}:${this.config.port}`);
        console.log(`   Theme: ${this.config.theme}`);
        console.log(`   Max Clients: ${this.config.maxClients}\n`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close();
      this.server.close(() => {
        console.log(`\n⏹️  Dashboard Server Stopped\n`);
        resolve();
      });
    });
  }

  /**
   * Get server status
   */
  getStatus(): {
    running: boolean;
    url: string;
    clients: number;
    updates: number;
    uptime: number;
  } {
    return {
      running: true,
      url: `http://${this.config.host}:${this.config.port}`,
      clients: this.wss.clients.size,
      updates: this.updateHistory.length,
      uptime: process.uptime(),
    };
  }

  /**
   * Get update history
   */
  getUpdateHistory(limit: number = 100): Array<{ timestamp: string; update: DashboardUpdate }> {
    return this.updateHistory.slice(-limit);
  }
}

/**
 * Global dashboard server instance
 */
let globalServer: CloudDashboardServer | null = null;

/**
 * Get or create global dashboard server
 */
export function getDashboardServer(
  config?: Partial<DashboardServerConfig>
): CloudDashboardServer {
  if (!globalServer) {
    globalServer = new CloudDashboardServer(config);
  }
  return globalServer;
}

/**
 * Helper: Start dashboard server
 */
export async function startDashboardServer(
  config?: Partial<DashboardServerConfig>
): Promise<CloudDashboardServer> {
  const server = getDashboardServer(config);
  await server.start();
  return server;
}

/**
 * Helper: Stop dashboard server
 */
export async function stopDashboardServer(): Promise<void> {
  if (globalServer) {
    await globalServer.stop();
    globalServer = null;
  }
}
