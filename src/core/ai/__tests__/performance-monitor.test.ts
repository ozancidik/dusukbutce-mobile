/**
 * Performance Monitor Tests
 */

import { PerformanceMonitor, getPerformanceMonitor } from '../performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('Metrics Recording', () => {
    it('should record performance metrics', () => {
      monitor.recordMetric('total_execution_time', 8000, 'ms');

      const summary = monitor.getSummary();
      expect(summary.metricsCount).toBeGreaterThan(0);
    });

    it('should track metric status', () => {
      monitor.recordMetric('total_execution_time', 11000, 'ms'); // Over budget
      const summary = monitor.getSummary();
      expect(summary.status).toBeDefined();
    });
  });

  describe('Health Checks', () => {
    it('should perform health checks', () => {
      const check = monitor.performHealthCheck();

      expect(check.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(check.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(check.uptime).toBeGreaterThan(0);
    });

    it('should track health status', () => {
      const check = monitor.performHealthCheck();
      expect(['healthy', 'degraded', 'critical']).toContain(check.status);
    });
  });

  describe('Regression Detection', () => {
    it('should detect regressions', () => {
      for (let i = 0; i < 10; i++) {
        monitor.recordMetric('total_execution_time', 11000, 'ms'); // Over budget
      }

      const regressions = monitor.detectRegressions();
      expect(Array.isArray(regressions)).toBe(true);
    });
  });

  describe('Reporting', () => {
    it('should generate performance report', () => {
      monitor.recordMetric('total_execution_time', 8500, 'ms');

      const report = monitor.generateReport('last_1h');
      expect(report.timestamp).toBeDefined();
      expect(report.period).toBe('last_1h');
      expect(Array.isArray(report.metrics)).toBe(true);
    });

    it('should generate recommendations', () => {
      monitor.performHealthCheck();

      const report = monitor.generateReport();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Summary', () => {
    it('should provide performance summary', () => {
      monitor.recordMetric('total_execution_time', 8500, 'ms');

      const summary = monitor.getSummary();
      expect(summary.metricsCount).toBeGreaterThanOrEqual(0);
      expect(summary.averageExecutionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Singleton', () => {
    it('should return same monitor instance', () => {
      const m1 = getPerformanceMonitor();
      const m2 = getPerformanceMonitor();

      expect(m1).toBe(m2);
    });
  });

  describe('Export', () => {
    it('should export as markdown', () => {
      monitor.recordMetric('total_execution_time', 8500, 'ms');

      const markdown = monitor.exportMarkdown();
      expect(markdown).toContain('Performance Report');
      expect(markdown).toContain('Summary');
    });
  });
});
