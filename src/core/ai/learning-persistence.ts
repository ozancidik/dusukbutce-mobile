/**
 * Learning State Persistence — Save/restore learning system state across restarts
 * Stores in ~/.ecc/learning-state.json with automatic backups
 */

import * as fs from 'fs';
import * as path from 'path';
import { LearningState } from './learning-metrics';
import { PatternMatch } from './pattern-detector';

// Yollar HER çağrıda HOME'dan hesaplanır (modül yüklenirken bir kez değil): testler
// HOME'u geçici dizine çevirir; sabit olsaydı gerçek ~/.ecc/ klasörüne yazılırdı.
const eccDir = () => path.join(process.env.HOME || '~', '.ecc');
const stateFile = () => path.join(eccDir(), 'learning-state.json');
const backupDir = () => path.join(eccDir(), 'backups');

// LearningState Map ve Date içerir; düz JSON.stringify Map'leri {} yapıp ajan/desen/risk
// verisini sessizce kaybediyordu. Map'ler { __map__: [[k, v], ...] } olarak saklanır.
const MAP_TAG = '__map__';

export function stringifyLearningState(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, val) => (val instanceof Map ? { [MAP_TAG]: Array.from(val.entries()) } : val),
    2
  );
}

export function parseLearningState(text: string): PersistentLearningState {
  const parsed = JSON.parse(text, (_key, val) =>
    val && typeof val === 'object' && Array.isArray((val as Record<string, unknown>)[MAP_TAG])
      ? new Map((val as Record<string, [unknown, unknown][]>)[MAP_TAG])
      : val
  ) as PersistentLearningState;

  // Eski sürümde yazılmış dosyalar Map'leri {} olarak içerir: boş Map'e normalleştir
  const st = parsed?.state as unknown as Record<string, unknown> | undefined;
  if (st) {
    for (const key of ['agents', 'patterns', 'fileRisks']) {
      if (!(st[key] instanceof Map)) {
        st[key] = new Map(Object.entries((st[key] as object) || {}));
      }
    }
    if (typeof st.lastAnalysis === 'string') st.lastAnalysis = new Date(st.lastAnalysis);
  }
  return parsed;
}


/**
 * Persistent state structure
 */
export interface PersistentLearningState {
  version: number;
  timestamp: string;
  branch: string;
  project: string;
  state: LearningState;
  patterns: PatternMatch[];
  metadata: {
    lastBackup: string;
    backupCount: number;
    recoveryCount: number;
  };
}

/**
 * Ensure ECC directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(eccDir())) {
    fs.mkdirSync(eccDir(), { recursive: true });
  }
  if (!fs.existsSync(backupDir())) {
    fs.mkdirSync(backupDir(), { recursive: true });
  }
}

/**
 * Save learning state to disk
 */
export function persistLearningState(
  state: LearningState,
  patterns: PatternMatch[],
  branch: string = 'unknown',
  project: string = 'dusukbutce-mobile'
): void {
  ensureDirectories();

  const persistentState: PersistentLearningState = {
    version: 1,
    timestamp: new Date().toISOString(),
    branch,
    project,
    state,
    patterns,
    metadata: {
      lastBackup: new Date().toISOString(),
      backupCount: countBackups(),
      recoveryCount: 0,
    },
  };

  try {
    // Create backup before overwriting
    if (fs.existsSync(stateFile())) {
      createBackup();
    }

    // Write current state
    fs.writeFileSync(
      stateFile(),
      stringifyLearningState(persistentState),
      'utf-8'
    );

    console.log(`✅ Learning state persisted to ${stateFile()}`);
    console.log(`   Timestamp: ${persistentState.timestamp}`);
    console.log(`   Confidence: ${(state.learningConfidence * 100).toFixed(0)}%`);
    console.log(`   Patterns: ${patterns.length}`);
  } catch (error) {
    console.error('❌ Failed to persist learning state:', error);
    throw error;
  }
}

/**
 * Load learning state from disk
 */
export function loadLearningState(): PersistentLearningState | null {
  ensureDirectories();

  if (!fs.existsSync(stateFile())) {
    console.log('ℹ️  No existing learning state found — starting fresh');
    return null;
  }

  try {
    const content = fs.readFileSync(stateFile(), 'utf-8');
    const persistedState = parseLearningState(content);

    console.log(`✅ Learning state loaded from ${stateFile()}`);
    console.log(`   Timestamp: ${persistedState.timestamp}`);
    console.log(`   Confidence: ${(persistedState.state.learningConfidence * 100).toFixed(0)}%`);
    console.log(`   Patterns: ${persistedState.patterns.length}`);
    console.log(`   Runs: ${persistedState.state.totalRuns}`);

    return persistedState;
  } catch (error) {
    console.error('❌ Failed to load learning state:', error);
    return null;
  }
}

/**
 * Create a backup of current learning state
 */
export function createBackup(): string {
  ensureDirectories();

  if (!fs.existsSync(stateFile())) {
    throw new Error('No learning state file to backup');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir(), `learning-state-${timestamp}.json`);

  try {
    fs.copyFileSync(stateFile(), backupFile);
    console.log(`✅ Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

/**
 * Count existing backups
 */
export function countBackups(): number {
  ensureDirectories();

  try {
    const files = fs.readdirSync(backupDir());
    return files.filter((f) => f.startsWith('learning-state-')).length;
  } catch {
    return 0;
  }
}

/**
 * List all backups
 */
export function listBackups(): Array<{ file: string; timestamp: string; size: number }> {
  ensureDirectories();

  try {
    const files = fs.readdirSync(backupDir());
    return files
      .filter((f) => f.startsWith('learning-state-'))
      .map((file) => {
        const fullPath = path.join(backupDir(), file);
        const stat = fs.statSync(fullPath);
        const timestamp = file.replace('learning-state-', '').replace('.json', '');
        return { file, timestamp, size: stat.size };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error('❌ Failed to list backups:', error);
    return [];
  }
}

/**
 * Restore from a specific backup
 */
export function restoreFromBackup(backupFile: string): PersistentLearningState | null {
  const fullPath = path.join(backupDir(), backupFile);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Backup file not found: ${fullPath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const restoredState = parseLearningState(content);

    // Write back to main state file
    fs.writeFileSync(
      stateFile(),
      stringifyLearningState(restoredState),
      'utf-8'
    );

    console.log(`✅ Restored from backup: ${backupFile}`);
    console.log(`   Timestamp: ${restoredState.timestamp}`);
    console.log(`   Confidence: ${(restoredState.state.learningConfidence * 100).toFixed(0)}%`);

    return restoredState;
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error);
    return null;
  }
}

/**
 * Get current learning state file status
 */
export function getLearningStateStatus(): {
  exists: boolean;
  path: string;
  timestamp?: string;
  confidence?: number;
  runCount?: number;
  size?: number;
  lastModified?: string;
} {
  if (!fs.existsSync(stateFile())) {
    return {
      exists: false,
      path: stateFile(),
    };
  }

  try {
    const stat = fs.statSync(stateFile());
    const content = fs.readFileSync(stateFile(), 'utf-8');
    const parsed = parseLearningState(content);

    return {
      exists: true,
      path: stateFile(),
      timestamp: parsed.timestamp,
      confidence: parsed.state.learningConfidence,
      runCount: parsed.state.totalRuns,
      size: stat.size,
      lastModified: new Date(stat.mtime).toISOString(),
    };
  } catch (error) {
    return {
      exists: false,
      path: stateFile(),
    };
  }
}

/**
 * Export learning state as markdown report
 */
export function exportLearningStateAsMarkdown(): string {
  const state = loadLearningState();
  if (!state) {
    return '# Learning State\n\nNo persisted learning state found.';
  }

  const { state: learningState, patterns } = state;

  let markdown = `# 📊 Learning State Report\n\n`;
  markdown += `**Exported:** ${new Date().toISOString()}\n`;
  markdown += `**Project:** ${state.project}\n`;
  markdown += `**Branch:** ${state.branch}\n\n`;

  markdown += `## 🧠 Learning Confidence\n`;
  markdown += `- **Confidence:** ${(learningState.learningConfidence * 100).toFixed(0)}%\n`;
  markdown += `- **Total Runs:** ${learningState.totalRuns}\n`;
  markdown += `- **Data Points:** ${Object.keys(learningState.agents).length} agents tracked\n\n`;

  markdown += `## ⚙️ Agent Metrics\n`;
  markdown += `| Agent | Success Rate | Runs | Avg Duration |\n`;
  markdown += `|-------|--------------|------|----------|\n`;
  for (const [name, metrics] of learningState.agents) {
    markdown += `| ${name} | ${(metrics.successRate * 100).toFixed(0)}% | ${metrics.runCount} | ${metrics.averageDuration.toFixed(0)}ms |\n`;
  }
  markdown += '\n';

  markdown += `## 🎯 Detected Patterns\n`;
  markdown += `| Pattern | Frequency | Confidence | Severity |\n`;
  markdown += `|---------|-----------|------------|----------|\n`;
  for (const p of patterns.slice(0, 10)) {
    markdown += `| ${p.pattern.name} | ${p.pattern.frequency} | ${(p.confidence * 100).toFixed(0)}% | ${p.pattern.severity.toUpperCase()} |\n`;
  }
  markdown += '\n';

  markdown += `## ⚠️ High-Risk Files\n`;
  markdown += `| File | Risk | Suggestions | Failures |\n`;
  markdown += `|------|------|-------------|----------|\n`;
  for (const [file, profile] of Array.from(learningState.fileRisks.entries()).slice(0, 5)) {
    markdown += `| ${file} | ${(profile.riskScore * 100).toFixed(0)}% | ${profile.totalSuggestions} | ${profile.failureCount} |\n`;
  }
  markdown += '\n';

  markdown += `## 📈 Insights\n`;
  for (const insight of learningState.insights.slice(0, 5)) {
    markdown += `- **${insight.title}** (${(insight.confidence * 100).toFixed(0)}%)\n`;
  }

  return markdown;
}

/**
 * Clear all learning state and backups (destructive)
 */
export function clearAllLearningState(confirmed: boolean = false): boolean {
  if (!confirmed) {
    console.warn('⚠️  Clearing learning state is destructive. Call with confirmed=true.');
    return false;
  }

  ensureDirectories();

  try {
    if (fs.existsSync(stateFile())) {
      fs.unlinkSync(stateFile());
      console.log('✅ Deleted learning state file');
    }

    // Note: Don't delete backups automatically
    console.log('ℹ️  Backups preserved in:', backupDir());
    return true;
  } catch (error) {
    console.error('❌ Failed to clear learning state:', error);
    return false;
  }
}

/**
 * Sync learning state to disk after run completes
 */
export function syncLearningState(
  state: LearningState,
  patterns: PatternMatch[],
  options: { branch?: string; project?: string; createBackup?: boolean } = {}
): void {
  const { branch = 'unknown', project = 'dusukbutce-mobile', createBackup: backup = true } = options;

  if (backup && fs.existsSync(stateFile())) {
    createBackup();
  }

  persistLearningState(state, patterns, branch, project);
}
