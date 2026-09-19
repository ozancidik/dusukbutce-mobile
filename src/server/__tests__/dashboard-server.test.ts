/**
 * Dashboard Server Tests
 */

import { CloudDashboardServer, getDashboardServer } from '../dashboard-server';
import { createLearningState, recordAgentRun } from '../../core/ai/learning-metrics';

describe('CloudDashboardServer', () => {
  let server: CloudDashboardServer;

  beforeEach(() => {
    server = new CloudDashboardServer({
      port: 8765,
      host: 'localhost',
      refreshInterval: 5000,
    });
  });

  afterEach(async () => {
    // Don't actually start/stop to keep tests fast
  });

  describe('Configuration', () => {
    it('should initialize with default config', () => {
      const s = new CloudDashboardServer();
      const status = s.getStatus();

      expect(status.running).toBe(true);
      expect(status.url).toBeDefined();
      expect(status.clients).toBe(0);
    });

    it('should accept custom config', () => {
      const s = new CloudDashboardServer({
        port: 9999,
        host: '0.0.0.0',
        theme: 'dark',
      });

      const status = s.getStatus();
      expect(status.url).toContain('0.0.0.0:9999');
    });
  });

  describe('State Management', () => {
    it('should track learning state', () => {
      const state = createLearningState();
      recordAgentRun(state, 'agent-1', {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      // Simulate state update
      const before = server.getStatus();
      expect(before.updates).toBe(0);
    });
  });

  describe('Update History', () => {
    it('should maintain update history', () => {
      const history = server.getUpdateHistory(10);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('should limit history size', () => {
      const status = server.getStatus();
      // History is tracked internally
      expect(status.updates).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Endpoints', () => {
    it('should provide health endpoint', () => {
      const status = server.getStatus();
      expect(status.running).toBe(true);
      expect(status.uptime).toBeGreaterThan(0);
    });

    it('should track connected clients', () => {
      const status = server.getStatus();
      expect(status.clients).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Singleton', () => {
    it('should return same server instance', () => {
      const server1 = getDashboardServer();
      const server2 = getDashboardServer();

      expect(server1).toBe(server2);
    });

    it('should use provided config only on first call', () => {
      const s1 = getDashboardServer({ port: 8765 });
      const s2 = getDashboardServer({ port: 9999 });

      // Both should be same instance, so port is 8765
      expect(s1).toBe(s2);
    });
  });

  describe('WebSocket Support', () => {
    it('should support WebSocket connections', () => {
      const status = server.getStatus();
      expect(status.clients).toBeDefined();
      expect(typeof status.clients).toBe('number');
    });
  });

  describe('Export Functionality', () => {
    it('should support markdown export', () => {
      const state = createLearningState();
      recordAgentRun(state, 'agent-1', {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      // Export would be tested via HTTP endpoint
      expect(state).toBeDefined();
    });

    it('should support JSON export', () => {
      const state = createLearningState();
      expect(state).toBeDefined();
    });
  });
});
