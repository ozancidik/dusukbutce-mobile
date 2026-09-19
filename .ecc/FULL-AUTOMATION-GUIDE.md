# ECC Full Automation Guide (Faz 2B/C/D)

**What's Happening:** Autonomous agents now intelligently trigger based on what you change. No manual orchestration needed.

---

## How It Works

### 1️⃣ You Make a Commit
```bash
git commit -m "feat: add price consultant"
```

### 2️⃣ Post-Commit Hook Triggers
```
Git Hook detects changes
  → Analyzes which files changed
  → Routes to appropriate agents
  → Executes in parallel (smart dependency resolution)
```

### 3️⃣ Agents Run Autonomously
- **perplexity-validator** → Tests API integration
- **humanizer** → Polishes text output
- **code-quality** → Lints & type-checks
- **mobile-qa** → Runs unit/smoke tests
- **security-scanner** → Dependency audit
- **build-optimizer** → Bundle analysis

### 4️⃣ Report Generated
```
.claude-flow/automation-reports/
  └─ 20260919-221534-abc123d.md
```

---

## Agent Decision Tree

| Changed Files | Agents Triggered |
|---------------|-----------------|
| `src/core/ai/perplexity.ts` | perplexity-validator → humanizer |
| `src/features/listings/**` | code-quality → mobile-qa |
| `package.json` | security-scanner → build-optimizer |
| Any file + `main` branch | ALL agents (parallel) |
| Commit message: `URGENT` | security-scanner + code-quality (priority) |

---

## Configuration Files

### `.ecc/agent-routing.yaml`
Defines:
- When agents trigger (file patterns, events)
- What actions they take
- Dependencies between agents
- Timeout & retry logic
- Learning/optimization settings

**Edit this to customize routing!**

### `.ecc/orchestration-setup.sh`
One-time setup script. Run once:
```bash
bash .ecc/orchestration-setup.sh
```

---

## Commands

### View Live Dashboard
```bash
npx ecc control-pane --port 8765
```
→ Real-time agent execution, decisions, metrics

### Check Orchestration Status
```bash
npx ecc status --markdown
```
→ Latest agent runs, success/fail rates

### View Automation Reports
```bash
ls -la .claude-flow/automation-reports/
cat .claude-flow/automation-reports/latest.md
```

### Learning Metrics
```bash
npx ecc status --json | jq '.learning_metrics'
```
→ Agent duration trends, optimization suggestions

### Dry-Run Before Committing
```bash
# In .ecc/agent-routing.yaml, set: dry_run: true
# Then commit normally
git commit -m "test: dry run"
# Agents will preview without executing
```

---

## Modes

### 1. Full Automatic (Current)
- Every commit → agents auto-trigger
- Feature branches: run & report
- Main: agents disabled (manual review + push only)

### 2. Manual Override
```bash
# Skip auto-trigger on THIS commit
git commit --no-verify -m "feat: skip orchestration"

# Force full orchestration anytime
npx ecc orchestrate --agents "perplexity-validator humanizer code-quality"
```

### 3. Watch-Only Mode
```bash
# Enable dry-run in agent-routing.yaml
# Agents analyze but don't execute
# Perfect for previewing before real commit
```

---

## How Agents Coordinate

```
Parallel execution (if no dependencies):
  code-quality ──┐
                 ├──> build-optimizer
  mobile-qa ────┘

Sequential (dependencies):
  perplexity-validator → humanizer → report

Smart scheduling:
  - Agents with no dependencies run in parallel
  - Once one finishes, dependents start
  - Timeouts & retries configured per agent
```

---

## What Gets Reported

Each run generates: `.claude-flow/automation-reports/{timestamp}-{commit}.md`

Contains:
- **Agent Execution**
  - What ran, when, duration
  - Success/failure per agent
  - Any warnings/errors

- **Code Quality**
  - Lint errors/warnings
  - Type check results
  - Test coverage

- **Security**
  - Dependency audit results
  - Vulnerability count
  - Fixed recommendations

- **Performance**
  - Bundle size change
  - Build time
  - Optimization suggestions

- **Learning Insights**
  - Patterns detected
  - Predicted next run duration
  - Agent ordering optimization

---

## Rules & Safety

### Feature Branches
✅ Agents auto-trigger  
✅ Reports saved  
✅ Parallel execution  
⚠️ Reports manual review before merge

### Main Branch
❌ Agents do NOT auto-trigger  
✅ Manual orchestration only  
✅ Requires explicit user approval  
✅ All changes reviewed first

### Throttling
- Max 4 concurrent agents (configurable)
- 300s timeout per agent (configurable)
- Automatic retry on failure (3x max)
- Graceful degradation on timeout

---

## Troubleshooting

**Agents not running on commit?**
```bash
# Check if hook is executable
ls -la .git/hooks/post-commit*

# Verify ECC is installed
npm list ecc-universal

# Manually trigger
npx ecc orchestrate
```

**Agent taking too long?**
```bash
# Increase timeout in .ecc/agent-routing.yaml
# Or skip that agent on this commit:
git commit --no-verify -m "skip slow agent"
```

**Want to modify routing?**
```bash
# Edit .ecc/agent-routing.yaml
# Dry-run first:
# Set dry_run: true
# Commit normally
# Agents preview without executing
```

**Emergency: Disable automation?**
```bash
# Temporarily disable orchestration:
git commit --no-verify -m "emergency commit"

# Or disable hook:
chmod -x .git/hooks/post-commit*
```

---

## What's Next?

### Faz 2C: Learning System
- Track agent performance over time
- Auto-optimize execution order
- Predict and cache results
- Proactive recommendations

### Faz 2D: Autonomous Decisions
- Agents suggest fixes automatically
- Auto-apply low-risk changes (formatting, updates)
- Manual approve high-risk changes

### Faz 3: Multi-Project Orchestration
- Coordinate Web + Mobile pipelines
- Unified dashboard across projects
- Shared learning system

---

## Questions?

- **Dashboard:** `npx ecc control-pane`
- **Logs:** `.claude-flow/automation-logs/`
- **Config:** `.ecc/agent-routing.yaml`
- **Reports:** `.claude-flow/automation-reports/`

**Happy autonomous coding! 🤖**
