# Faz 4a: Suggestion Engine Core ✅

**Tarih:** 2026-09-19  
**Durum:** 🎯 **Faz 4a Complete**  
**Scope:** Autonomous suggestion generation, risk classification, and orchestration

---

## 📦 Oluşturulan Dosyalar

### **1. `src/core/ai/suggestions.ts`** (270 lines)
**Amaç:** Suggestion schema, risk classifier, agent-specific generators

**Bileşenler:**
- `SuggestionType` — 9 suggestion types (format-fix, lint-fix, type-fix, null-check, etc.)
- `RiskLevel` — low, medium, high
- `Suggestion` interface — Complete suggestion data structure
- `riskClassifier` — Maps suggestion type → risk level → auto-apply decision
- `AgentSuggestions` namespace — Generators for each agent:
  - `fromCodeQuality()` — Lint errors, type issues
  - `fromMobileQA()` — Test failures, null checks
  - `fromSecurityScanner()` — Vulnerabilities

**Risk Matrix:**
```
Low-Risk (Auto-Apply):
├─ format-fix (prettier, spacing)
├─ lint-fix (eslint auto-fixes)
├─ import-cleanup (unused imports)
└─ type-fix (Array<T> → T[])

Medium-Risk (Manual Approval):
├─ null-check (logic needed)
├─ test-fix (test modifications)
└─ dependency-update (may have side effects)

High-Risk (Always Manual):
├─ security-patch (CVEs)
└─ logic-fix (business logic)
```

### **2. `src/core/ai/auto-apply.ts`** (180 lines)
**Amaç:** Automatically apply low-risk suggestions

**Bileşenler:**
- `ApplyResult` interface — tracks what was applied/failed
- `autoApplySuggestions()` — Main function for batch auto-apply
- Suggestion type handlers:
  - `applyFormatFix()` — Runs prettier
  - `applyLintFix()` — Runs eslint --fix
  - `applyImportCleanup()` — Parses & removes unused imports
  - `applyTypeFix()` — Applies type annotations
- `generateAutoFixCommitMessage()` — Creates commit message
- `reportAutoApplyResults()` — Formats results table

**Features:**
- Parallel execution (configurable concurrency)
- Stop-on-first-failure option
- Dry-run mode for previewing
- Detailed error reporting

### **3. `src/core/ai/suggestion-orchestrator.ts`** (310 lines)
**Amaç:** Master coordinator for suggestions across all agents

**Bileşenler:**
- `orchestrateSuggestions()` — Main orchestration function
- Deduplication — Removes duplicate suggestions, keeps highest confidence
- Per-file limiting — Max 10 suggestions per file (configurable)
- Routing logic:
  - Separates by `action` (auto_apply, manual_approval, manual_only)
  - Auto-applies low-risk if enabled
  - Queues medium/high-risk for review
- Reporting — Generates markdown report with:
  - Auto-apply results
  - Pending approval list
  - Files affected (grouped by risk)

**Workflow:**
```
All Suggestions from Agents
  ↓
Deduplicate Similar
  ↓
Limit Per File (max 10)
  ↓
Separate by Risk Level
  ├─ Low-Risk → Auto-Apply
  ├─ Medium-Risk → Queue for Review
  └─ High-Risk → Queue for Review
  ↓
Generate Report
  ↓
Return Results
```

### **4. `src/core/ai/suggestion-dashboard.ts`** (380 lines)
**Amaç:** UI and reporting for suggestions

**Bileşenler:**
- `DashboardState` — Tracks suggestions and approvals
- State management:
  - `addSuggestionsToDashboard()` — Add new suggestions
  - `approveSuggestion()` — User clicks approve
  - `rejectSuggestion()` — User clicks reject with reason
  - `groupSuggestionsByStatus()` — Group by status
  - `getDashboardStats()` — Get counts/metrics
- Rendering:
  - `generateDashboardHTML()` — Interactive web UI
  - `generateDashboardMarkdown()` — Markdown report
  - Risk/status badges with color coding

**Dashboard Features:**
- Stats card (total, pending, approved, applied)
- Pending suggestions with approve/reject buttons
- Approved suggestions history
- Applied suggestions history
- Rejected suggestions with reasons
- One-click approval workflow

---

## 🎯 Faz 4a Capabilities

### **Suggestion Generation**
✅ Code quality issues → suggestion  
✅ Test failures → suggestion  
✅ Security vulnerabilities → suggestion  
✅ Type safety issues → suggestion  

### **Risk Classification**
✅ Low-risk auto-detection  
✅ Medium-risk flagging  
✅ High-risk gating  
✅ Confidence scoring (0-1)  

### **Auto-Apply Logic**
✅ Parallel execution (5 concurrent max)  
✅ Format fixes (prettier)  
✅ Lint fixes (eslint --fix)  
✅ Import cleanup  
✅ Type annotations  
✅ Dry-run preview mode  

### **Orchestration**
✅ Deduplication  
✅ Per-file limiting  
✅ Smart routing (auto vs manual)  
✅ Detailed reporting  

### **Dashboard/UI**
✅ HTML dashboard (interactive)  
✅ Markdown reports  
✅ Status tracking  
✅ Approval workflow  
✅ Rejection reasons  

---

## 📊 Data Flow Example

### **Scenario: Lint Error Fixed Automatically**

```
Mobile Developer commits:
  git commit -m "feat: add feature"

↓

code-quality agent runs:
  - ESLint detects: "unused variable 'preset'"
  - Type check: "Array<T> should be T[]"

↓

generateSuggestion() creates:
  {
    id: "sug_1695...abc",
    type: "lint-fix",
    severity: "low",
    title: "Fix: unused variable 'preset'",
    files: ["src/core/ai/perplexity.ts"],
    action: "auto_apply",
    confidence: 0.99,
    agentSource: "code-quality"
  }

↓

orchestrateSuggestions() routes:
  - Severity: low → action: auto_apply
  - Immediately applies via ESLint

↓

autoApplySuggestions() execution:
  1. applyLintFix() runs
  2. File modified ✓
  3. Tests run
  4. ApplyResult recorded

↓

generateAutoFixCommitMessage():
  "chore: auto-apply low-risk agent suggestions
   Applied 2 fixes:
   - unused variable 'preset'
   - Array<T> type annotation"

↓

Dashboard shows:
  ✅ APPLIED (Lint Fix)
  Files: src/core/ai/perplexity.ts
  Duration: 245ms
```

### **Scenario: Null Check (Medium Risk)**

```
mobile-qa runs test:
  - Test fails: "Cannot read property 'answer' of null"

↓

generateSuggestion() creates:
  {
    type: "null-check",
    severity: "medium",
    title: "Test Failure: Add null check",
    action: "manual_approval",
    confidence: 0.85,
  }

↓

orchestrateSuggestions() routes:
  - Severity: medium → action: manual_approval
  - Queues for user review (NOT auto-applied)

↓

Dashboard shows:
  ⏳ PENDING APPROVAL
  Risk: MEDIUM (yellow badge)
  Confidence: 85%
  [✓ Approve] [✗ Reject]

↓

User clicks Approve:
  - Suggestion marked as approved
  - Can be auto-applied in next run
  - Or user can apply manually

↓

If Rejected:
  - Marked with rejection reason
  - Logged for future learning
```

---

## 🔄 Integration Points

### **With ECC Agents**
Each agent type can generate suggestions:
```typescript
// In mobile-qa agent output:
const suggestions = AgentSuggestions.fromMobileQA({
  failures: [{
    test: "TechnicalServiceFormScreen.test.tsx",
    error: "Cannot read property 'answer' of null",
    file: "src/features/technicalService/...",
  }]
});
```

### **With Auto-Apply Pipeline**
```typescript
// After agent runs:
const result = await autoApplySuggestions(suggestions, {
  dryRun: false,
  maxConcurrent: 5,
  stopOnFirstFailure: false
});
```

### **With Dashboard**
```typescript
// UI integration:
const state = createDashboardState();
addSuggestionsToDashboard(state, suggestions);

// User approves:
approveSuggestion(state, "sug_123_abc");

// Generate report:
const html = generateDashboardHTML(state);
```

---

## 📋 Success Criteria (Faz 4a) ✅

- ✅ Suggestion schema defined
- ✅ Risk classifier implemented
- ✅ 9 suggestion types supported
- ✅ Auto-apply logic written
- ✅ Orchestration engine complete
- ✅ Dashboard UI/reporting done
- ✅ Agent-specific generators ready
- ✅ Confidence scoring system
- ✅ Deduplication logic
- ✅ Approval workflow foundation

---

## 🚀 Next Phase: Faz 4b (Auto-Apply Integration)

**What Faz 4b will do:**
1. ✅ Connect agents to suggestion generator
2. ✅ Wire up auto-apply to build pipeline
3. ✅ Integrate dashboard with ECC control-pane
4. ✅ Test end-to-end: commit → suggestion → apply → test

**Expected Timeline:** 1-2 sessions

---

## 📁 Files Ready to Commit

```
src/core/ai/
├── suggestions.ts (270 lines) — Schema & classification
├── auto-apply.ts (180 lines) — Auto-fix logic
├── suggestion-orchestrator.ts (310 lines) — Master coordinator
└── suggestion-dashboard.ts (380 lines) — UI/reporting

Total: 1,140 lines of TypeScript
```

---

## 🎊 Faz 4a Summary

**Suggestion Engine Core completed!**

✅ Agents can now generate structured suggestions  
✅ Suggestions are classified by risk automatically  
✅ Low-risk fixes can be applied autonomously  
✅ Medium/high-risk fixes queue for user review  
✅ Dashboard provides approval workflow  
✅ Reports track applied/pending/rejected  

**Architecture ready for:**
- Continuous autonomous improvement
- Minimal developer context-switching
- Automatic test-driven fixes
- Learning from patterns

---

**Built by:** Claude Haiku 4.5  
**Date:** 2026-09-19  
**Next:** Faz 4b (Auto-Apply Integration) 🚀  
**Status:** Ready for Faz 4b implementation
