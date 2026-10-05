// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // .claude/worktrees: ajan worktree'leri repo kopyası içerir; lint gürültüsü yaratıyordu
    ignores: ["dist/*", ".claude/worktrees/**"],
  }
]);
