# Commit-Triggered Automation Pipeline

Lightweight CI/CD automation for dusukbutce-web. No autonomous agents — you control when it runs.

## How It Works

1. **Git hook** (lightweight)
   - On every commit, logs to `.claude-flow/post-commit.log`
   - Prints suggestion: `💡 Run: npx ruflo automation run post-commit`

2. **Manual trigger** (you decide)
   ```bash
   bash .claude/automation/run-pipeline.sh
   ```

3. **Report generation** (always)
   - Saves to `.claude-flow/automation-reports/<timestamp>-<commit>.md`
   - Follows project discipline: end each run with a report

4. **CI/CD integration** (optional)
   - Add to GitHub Actions to run on PR/push
   - Reports appear as artifacts

## Pipeline Stages

| Stage | Tools | Time | Reports |
|-------|-------|------|---------|
| **Lint** | eslint, tsc | 30s | Errors/warnings |
| **Test** | Jest | 60s | Coverage, pass/fail |
| **Security** | npm audit, snyk | 30s | Vulnerabilities |
| **Build** | Next.js build | 90s | Bundle size, warnings |

## Usage

### After each commit (manual)
```bash
bash .claude/automation/run-pipeline.sh
```

### From CI/CD (GitHub Actions)
```yaml
- name: Run automation pipeline
  run: bash .claude/automation/run-pipeline.sh
```

### Check reports
```bash
ls -lht .claude-flow/automation-reports/
cat .claude-flow/automation-reports/latest.md
```

## Learning System

Every run logs:
- Duration per stage
- Failures and patterns
- Common errors
- Success metrics

Ruflo's learning system tracks this for:
- Performance optimization
- Pattern recognition
- Auto-fix suggestions

## Philosophy

- **Discipline**: Every run leaves a report
- **Control**: User/CI decides when to run (not unsupervised)
- **Transparency**: All outputs logged and archived
- **Scope**: Stays within project constraints (CLAUDE.md)
