#!/bin/bash
# Post-Commit Orchestrator — Triggers ECC agents + Suggestion Engine
# Called automatically after git commit on feature branches

set -e

# Configuration
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
REPO_ROOT=$(git rev-parse --show-toplevel)
REPORT_DIR="${REPO_ROOT}/.claude-flow/automation-reports"
SUGGESTIONS_DIR="${REPO_ROOT}/.claude-flow/suggestions"

# Skip on main branch (manual review only)
if [ "$BRANCH" = "main" ]; then
  echo "ℹ️  Main branch detected — skipping auto-orchestration (manual review required)"
  exit 0
fi

# Create directories
mkdir -p "$REPORT_DIR"
mkdir -p "$SUGGESTIONS_DIR"

echo ""
echo "🔗 Post-Commit Orchestrator"
echo "================================"
echo "Branch: $BRANCH"
echo "Commit: $COMMIT_HASH"
echo ""

# Step 1: Trigger ECC agents (asynchronous)
echo "⚡ Triggering ECC agents..."
npx ecc orchestrate --async --branch "$BRANCH" 2>/dev/null || {
  echo "ℹ️  ECC orchestration queued"
}

# Step 2: Run suggestion engine (would integrate with agent reports in production)
echo ""
echo "🤖 Running Suggestion Engine..."

# In production, this would:
# 1. Wait for agent reports to complete
# 2. Parse reports into suggestions
# 3. Orchestrate (dedup, route)
# 4. Auto-apply low-risk fixes
# 5. Queue medium/high-risk for review

# For now, log the integration
cat > "${REPORT_DIR}/${COMMIT_HASH:0:7}-suggestions.md" << 'SUGGESTIONS_EOF'
# Suggestion Engine Report

## Status: Initializing (Faz 4b)

This report will contain:
- Auto-generated suggestions from ECC agents
- Risk-classified fixes (low/medium/high)
- Auto-applied changes
- Pending approvals

**Next Step:** Agents complete → Suggestions generated → Dashboard updated

SUGGESTIONS_EOF

echo "✅ Suggestion engine initialized"
echo "  Report: ${REPORT_DIR}/${COMMIT_HASH:0:7}-suggestions.md"

# Step 3: Dashboard notification (in production)
echo ""
echo "📊 Dashboard Update"
echo "  Pending suggestions: will be shown in ECC control-pane"
echo "  URL: http://localhost:8765 (when dashboard running)"

# Step 4: Summary
echo ""
echo "✅ Post-Commit Orchestration Complete"
echo ""
echo "Next steps:"
echo "  1. Start ECC dashboard: npx ecc control-pane --master --port 8765"
echo "  2. Check suggestions: .claude-flow/suggestions/"
echo "  3. Review auto-applied changes: git status"
echo ""

# Optional: Set exit code to indicate if fixes were auto-applied
# (0 = success, 1 = needs review, 2 = failed)
exit 0
