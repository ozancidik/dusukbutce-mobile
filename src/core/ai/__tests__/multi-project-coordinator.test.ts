/**
 * Multi-Project Coordinator Tests
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MultiProjectCoordinator,
  getMultiProjectCoordinator,
} from '../multi-project-coordinator';
import { createLearningState, recordAgentRun } from '../learning-metrics';
import { detectPatterns } from '../pattern-detector';

describe('MultiProjectCoordinator', () => {
  let coordinator: MultiProjectCoordinator;
  let testDir: string;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    testDir = path.join('/tmp', `test-coordinator-${Date.now()}`);
    process.env.HOME = testDir;
    fs.mkdirSync(testDir, { recursive: true });
    coordinator = new MultiProjectCoordinator();
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    process.env.HOME = originalHome;
  });

  describe('Project Registration', () => {
    it('should register projects', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      const projects = coordinator.getProjects();
      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('dusukbutce-web');
      expect(projects[1].name).toBe('dusukbutce-mobile');
    });

    it('should track project info', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      const projects = coordinator.getProjects();

      const webProject = projects.find((p) => p.name === 'dusukbutce-web');
      expect(webProject?.type).toBe('web');
      expect(webProject?.isActive).toBe(true);
    });
  });

  describe('Dependencies', () => {
    it('should add dependencies', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      coordinator.addDependency(
        'dusukbutce-web',
        'dusukbutce-mobile',
        'api',
        'Mobile tests verify web API'
      );

      const dependencies = coordinator.getDependencies();
      expect(dependencies).toHaveLength(1);
      expect(dependencies[0].source).toBe('dusukbutce-web');
      expect(dependencies[0].target).toBe('dusukbutce-mobile');
    });

    it('should get project-specific dependencies', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      coordinator.addDependency(
        'dusukbutce-web',
        'dusukbutce-mobile',
        'api',
        'API tests'
      );

      const webDeps = coordinator.getProjectDependencies('dusukbutce-web');
      expect(webDeps.outgoing).toHaveLength(1);
      expect(webDeps.incoming).toHaveLength(0);

      const mobileDeps = coordinator.getProjectDependencies('dusukbutce-mobile');
      expect(mobileDeps.incoming).toHaveLength(1);
      expect(mobileDeps.outgoing).toHaveLength(0);
    });
  });

  describe('Metrics Update', () => {
    it('should update project metrics', () => {
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      const state = createLearningState();
      recordAgentRun(state, 'agent-1', {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      coordinator.updateProjectMetrics('dusukbutce-mobile', state, []);

      const metrics = coordinator.getMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics?.totalRuns).toBe(1);
    });

    it('should aggregate metrics across projects', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      const webState = createLearningState();
      recordAgentRun(webState, 'agent-1', {
        duration: 500,
        success: true,
        suggestionsCount: 3,
        appliedCount: 2,
      });

      const mobileState = createLearningState();
      recordAgentRun(mobileState, 'agent-1', {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      coordinator.updateProjectMetrics('dusukbutce-web', webState, []);
      coordinator.updateProjectMetrics('dusukbutce-mobile', mobileState, []);

      const metrics = coordinator.getMetrics();
      expect(metrics?.totalRuns).toBe(2);
      expect(metrics?.projectMetrics.size).toBe(2);
    });
  });

  describe('Cross-Project Insights', () => {
    it('should generate insights', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      const webState = createLearningState();
      recordAgentRun(webState, 'agent-1', {
        duration: 500,
        success: true,
        suggestionsCount: 3,
        appliedCount: 2,
      });

      coordinator.updateProjectMetrics('dusukbutce-web', webState, []);

      const insights = coordinator.generateCrossProjectInsights();
      expect(insights).toBeDefined();
    });
  });

  describe('Persistence', () => {
    it('should persist coordination state', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      coordinator.addDependency(
        'dusukbutce-web',
        'dusukbutce-mobile',
        'api',
        'API tests'
      );

      coordinator.persist();

      const dataFile = path.join(testDir, '.ecc', 'multi-project', 'coordination.json');
      expect(fs.existsSync(dataFile)).toBe(true);
    });

    it('should load coordination state', () => {
      const coordinator1 = new MultiProjectCoordinator();
      coordinator1.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator1.persist();

      const coordinator2 = new MultiProjectCoordinator();
      const loaded = coordinator2.load();

      expect(loaded).toBe(true);
      expect(coordinator2.getProjects()).toHaveLength(1);
      expect(coordinator2.getProjects()[0].name).toBe('dusukbutce-web');
    });
  });

  describe('Report Generation', () => {
    it('should generate coordination report', () => {
      coordinator.registerProject('dusukbutce-web', '/path/to/web', 'web');
      coordinator.registerProject('dusukbutce-mobile', '/path/to/mobile', 'mobile');

      coordinator.addDependency(
        'dusukbutce-web',
        'dusukbutce-mobile',
        'api',
        'API tests'
      );

      const report = coordinator.generateReport();
      expect(report).toContain('Multi-Project Coordination Report');
      expect(report).toContain('dusukbutce-web');
      expect(report).toContain('dusukbutce-mobile');
      expect(report).toContain('Dependencies');
    });
  });

  describe('Singleton', () => {
    it('should return same coordinator instance', () => {
      const coord1 = getMultiProjectCoordinator();
      const coord2 = getMultiProjectCoordinator();

      expect(coord1).toBe(coord2);
    });
  });
});
