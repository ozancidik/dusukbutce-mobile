/**
 * @jest-environment node
 *
 * Learning Persistence Tests
 */

import * as fs from "fs";
import * as path from "path";
import {
  persistLearningState,
  loadLearningState,
  createBackup,
  countBackups,
  listBackups,
  restoreFromBackup,
  getLearningStateStatus,
  exportLearningStateAsMarkdown,
  clearAllLearningState,
  syncLearningState,
} from "../learning-persistence";
import { createLearningState, recordAgentRun } from "../learning-metrics";

describe("Learning Persistence", () => {
  let testDir: string;
  const originalHome = process.env.HOME;

  beforeEach(() => {
    // Use temp directory for tests
    testDir = path.join("/tmp", `test-learning-${Date.now()}`);
    process.env.HOME = testDir;
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    process.env.HOME = originalHome;
  });

  describe("persistLearningState", () => {
    it("should save learning state to disk", () => {
      const state = createLearningState();
      recordAgentRun(state, "test-agent", {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      persistLearningState(state, [], "main", "test-project");

      const stateFile = path.join(testDir, ".ecc", "learning-state.json");
      expect(fs.existsSync(stateFile)).toBe(true);
    });

    it("should include all state data", () => {
      const state = createLearningState();
      recordAgentRun(state, "agent-1", {
        duration: 500,
        success: true,
        suggestionsCount: 2,
        appliedCount: 2,
      });

      persistLearningState(state, [], "feature-branch", "test-project");

      const status = getLearningStateStatus();
      expect(status.exists).toBe(true);
      expect(status.confidence).toBeLessThanOrEqual(state.learningConfidence);
      expect(status.runCount).toBe(state.totalRuns);
    });
  });

  describe("loadLearningState", () => {
    it("should return null if no state exists", () => {
      const loaded = loadLearningState();
      expect(loaded).toBeNull();
    });

    it("should load persisted state", () => {
      const state = createLearningState();
      recordAgentRun(state, "agent-1", {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });

      persistLearningState(state, [], "main", "test-project");

      const loaded = loadLearningState();
      expect(loaded).not.toBeNull();
      expect(loaded?.state.totalRuns).toBe(state.totalRuns);
      expect(loaded?.project).toBe("test-project");
      expect(loaded?.branch).toBe("main");
    });
  });

  describe("Backups", () => {
    it("should create backup automatically", () => {
      const state = createLearningState();
      persistLearningState(state, [], "main", "test-project");
      persistLearningState(state, [], "main", "test-project"); // Second save

      const backups = listBackups();
      expect(backups.length).toBeGreaterThan(0);
    });

    it("should list backups with metadata", () => {
      const state = createLearningState();
      persistLearningState(state, [], "main", "test-project");

      const backupFile = createBackup();
      const backups = listBackups();

      expect(backups.length).toBeGreaterThan(0);
      expect(backups[0].file).toBeDefined();
      expect(backups[0].size).toBeGreaterThan(0);
    });

    it("should restore from backup", () => {
      const state1 = createLearningState();
      recordAgentRun(state1, "agent-1", {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });
      persistLearningState(state1, [], "main", "test-project");

      // İkinci kayıt, birincinin yedeğini oluşturur (ilk kayıtta önceki dosya yok)
      const state2 = createLearningState();
      persistLearningState(state2, [], "main", "test-project");

      const backups = listBackups();
      expect(backups.length).toBeGreaterThan(0);

      // Restore
      const restored = restoreFromBackup(backups[0].file);
      expect(restored).not.toBeNull();
      expect(restored?.state.totalRuns).toBe(1);
    });
  });

  describe("getLearningStateStatus", () => {
    it("should return status object", () => {
      const state = createLearningState();
      persistLearningState(state, [], "main", "test-project");

      const status = getLearningStateStatus();
      expect(status.exists).toBe(true);
      expect(status.path).toBeDefined();
      expect(status.timestamp).toBeDefined();
      expect(status.size).toBeGreaterThan(0);
    });

    it("should indicate when state does not exist", () => {
      const status = getLearningStateStatus();
      expect(status.exists).toBe(false);
    });
  });

  describe("exportLearningStateAsMarkdown", () => {
    it("should generate markdown report", () => {
      const state = createLearningState();
      recordAgentRun(state, "agent-1", {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });
      persistLearningState(state, [], "main", "test-project");

      const markdown = exportLearningStateAsMarkdown();
      expect(markdown).toContain("Learning State Report");
      expect(markdown).toContain("test-project");
      expect(markdown).toContain("Agent Metrics");
    });

    it("should handle empty state gracefully", () => {
      const markdown = exportLearningStateAsMarkdown();
      expect(markdown).toContain("Learning State");
    });
  });

  describe("clearAllLearningState", () => {
    it("should not clear without confirmation", () => {
      const state = createLearningState();
      persistLearningState(state, [], "main", "test-project");

      const result = clearAllLearningState(false);
      expect(result).toBe(false);

      const status = getLearningStateStatus();
      expect(status.exists).toBe(true);
    });

    it("should clear with confirmation", () => {
      const state = createLearningState();
      persistLearningState(state, [], "main", "test-project");

      const result = clearAllLearningState(true);
      expect(result).toBe(true);

      const status = getLearningStateStatus();
      expect(status.exists).toBe(false);
    });
  });

  describe("syncLearningState", () => {
    it("should sync state with backup", () => {
      const state1 = createLearningState();
      syncLearningState(state1, [], { createBackup: false });

      const state2 = createLearningState();
      recordAgentRun(state2, "agent-1", {
        duration: 1000,
        success: true,
        suggestionsCount: 5,
        appliedCount: 3,
      });
      syncLearningState(state2, [], { createBackup: true });

      const backups = listBackups();
      expect(backups.length).toBeGreaterThan(0);

      const loaded = loadLearningState();
      expect(loaded?.state.totalRuns).toBe(1);
    });
  });
  describe("Map/Date serileştirme (regresyon)", () => {
    it("ajan verisi kaydet/yükle sonrası Map olarak korunur", () => {
      const state = createLearningState();
      recordAgentRun(state, "agent-x", {
        duration: 500,
        success: true,
        suggestionsCount: 2,
        appliedCount: 1,
      });
      persistLearningState(state, [], "main", "test-project");

      const loaded = loadLearningState();
      expect(loaded?.state.agents).toBeInstanceOf(Map);
      expect(loaded?.state.agents.has("agent-x")).toBe(true);
      expect(loaded?.state.lastAnalysis).toBeInstanceOf(Date);
    });

    it("eski sürümde {} olarak yazılmış Map alanları boş Map olarak yüklenir", () => {
      fs.mkdirSync(path.join(testDir, ".ecc"), { recursive: true });
      fs.writeFileSync(
        path.join(testDir, ".ecc", "learning-state.json"),
        JSON.stringify({
          version: 1,
          timestamp: new Date().toISOString(),
          branch: "main",
          project: "eski",
          state: {
            agents: {},
            patterns: {},
            fileRisks: {},
            insights: [],
            totalRuns: 3,
            lastAnalysis: new Date().toISOString(),
            learningConfidence: 0,
          },
          patterns: [],
          metadata: { lastBackup: "", backupCount: 0, recoveryCount: 0 },
        }),
      );
      const loaded = loadLearningState();
      expect(loaded?.state.agents).toBeInstanceOf(Map);
      expect(loaded?.state.agents.size).toBe(0);
      expect(loaded?.state.totalRuns).toBe(3);
    });

    it("testler gerçek ~/.ecc klasörüne yazmaz (HOME her çağrıda okunur)", () => {
      persistLearningState(createLearningState(), [], "main", "test-project");
      expect(
        fs.existsSync(path.join(testDir, ".ecc", "learning-state.json")),
      ).toBe(true);
    });
  });
});
