#!/bin/bash
# Manual automation pipeline runner
# Call: npx ruflo automation run post-commit
# Or: bash .claude/automation/run-pipeline.sh

set -e

echo "🔍 Starting automation pipeline..."
echo "---"

TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPORT_FILE=".claude-flow/automation-reports/$(date +'%Y%m%d-%H%M%S')-$COMMIT.md"

mkdir -p .claude-flow/automation-reports

{
  echo "# Automation Report"
  echo "**Time:** $TIMESTAMP"
  echo "**Commit:** $COMMIT"
  echo "**Branch:** $BRANCH"
  echo ""
  echo "## Pipeline Results"
  echo ""

  # Stage 1: Lint
  echo "### 1️⃣  Lint & Type Check"
  if npx eslint app/ --max-warnings=0 2>&1 && npx tsc --noEmit -p tsconfig.json 2>&1; then
    echo "✅ Lint passed"
    lint_status="PASS"
  else
    echo "⚠️  Lint failed"
    lint_status="FAIL"
  fi
  echo ""

  # Stage 2: Tests
  echo "### 2️⃣  Unit Tests"
  if npm test -- --coverage --passWithNoTests 2>&1; then
    echo "✅ Tests passed"
    test_status="PASS"
  else
    echo "⚠️  Tests failed"
    test_status="FAIL"
  fi
  echo ""

  # Stage 3: Security
  echo "### 3️⃣  Security Audit"
  if npm audit --audit-level=moderate 2>&1; then
    echo "✅ No critical vulnerabilities"
    security_status="PASS"
  else
    echo "⚠️  Vulnerabilities found (see above)"
    security_status="FAIL"
  fi
  echo ""

  # Stage 4: Build
  echo "### 4️⃣  Build"
  if npm run build 2>&1; then
    echo "✅ Build successful"
    build_status="PASS"
  else
    echo "❌ Build failed"
    build_status="FAIL"
  fi
  echo ""

  # Summary
  echo "## Summary"
  echo "- Lint: **$lint_status**"
  echo "- Tests: **$test_status**"
  echo "- Security: **$security_status**"
  echo "- Build: **$build_status**"
  echo ""
  echo "---"
  echo "Report saved: \`$REPORT_FILE\`"

} | tee "$REPORT_FILE"

echo ""
echo "✅ Automation pipeline complete"
