// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .claude/worktrees/ holds temporary git worktrees created by background
// agents (each with its own node_modules) — Metro's file watcher must not
// crawl into them, or a large/partial worktree can hang bundler startup
// entirely (observed: multi-minute stalls before the dev server even binds
// its port).
config.resolver.blockList = [/\.claude\/worktrees\/.*/];

module.exports = config;
