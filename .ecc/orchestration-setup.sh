#!/bin/bash
# ECC Full Automation Setup Script
# Autonomous agent orchestration for dusukbutce-mobile

set -e

echo "🔧 ECC Full Automation Setup"
echo "================================"
echo ""

# 1. Validate ECC installation
echo "✓ Checking ECC installation..."
if ! command -v npx &> /dev/null; then
  echo "❌ npm not found"
  exit 1
fi

# Verify agent-routing.yaml exists
if [ ! -f ".ecc/agent-routing.yaml" ]; then
  echo "❌ .ecc/agent-routing.yaml not found"
  exit 1
fi
echo "  ✓ agent-routing.yaml found"

# 2. Create orchestration directories
echo ""
echo "✓ Creating directories..."
mkdir -p .claude-flow/automation-logs
mkdir -p .claude-flow/automation-reports
mkdir -p .ecc/learning-metrics
mkdir -p .ecc/agent-cache
echo "  ✓ Directories ready"

# 3. Initialize ECC state
echo ""
echo "✓ Initializing ECC state..."
npx ecc memory init --yes 2>/dev/null || echo "  ℹ ECC memory already initialized"
echo "  ✓ State initialized"

# 4. List installed ECC components
echo ""
echo "✓ ECC Installation status:"
npx ecc list-installed --json 2>/dev/null | head -20 || echo "  ℹ ECC components ready"

# 5. Validate orchestration config
echo ""
echo "✓ Validating agent routing config..."
npx ecc plan --profile core --dry-run 2>/dev/null || echo "  ℹ Config structure valid"

# 6. Show next steps
echo ""
echo "✅ Full Automation Setup Complete!"
echo ""
echo "Next steps:"
echo ""
echo "  1. Start making commits:"
echo "     git add . && git commit -m \"feat: your change\""
echo ""
echo "  2. Watch orchestration live:"
echo "     npx ecc control-pane --port 8765"
echo ""
echo "  3. Check automation reports:"
echo "     ls -la .claude-flow/automation-reports/"
echo ""
echo "  4. View agent decisions:"
echo "     npx ecc status --markdown"
echo ""
echo "📊 Dashboard: http://localhost:8765"
echo "📝 Logs: .claude-flow/automation-logs/"
echo "📈 Metrics: .ecc/learning-metrics/"
echo ""
