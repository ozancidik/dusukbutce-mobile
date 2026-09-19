# Faz 4 Planning — Autonomous Decision Making

**Tarih:** 2026-09-19  
**Durum:** 🎯 **Planning Phase**  
**Scope:** Agents otomatik olarak fix suggestion'lar yapıp, low-risk changes'leri auto-apply etme

---

## 🤖 Faz 4 Nedir?

Şu anda:
```
Code Commit → Agents Çalış → Report (STOP - USER REVIEWS)
                                      ↓
                              User manuel fix yapar
                                      ↓
                              Re-commit & re-test
```

Faz 4'te:
```
Code Commit → Agents Çalış → Analysis
                                ↓
                    Suggestion Engine (Otomatik)
                                ↓
                    ┌──────────────────────┐
                    ├─ Low-Risk (Auto-Apply)
                    │  • Format fixes
                    │  • Lint auto-fixes
                    │  • Dependency updates
                    │
                    └─ High-Risk (Manual)
                       • Logic changes
                       • Security patches
                       • Breaking changes
                                ↓
                        User Reviews & Approves
                                ↓
                        Changes Applied
```

---

## 🎯 Faz 4 Bileşenleri

### **1. Suggestion Engine**

Agents'lar başarısız testleri gördüğünde otomatik olarak çözüm önerir:

```yaml
# code-quality agent çalıştı, lint errors buldu
Suggestion:
  type: "eslint-fix"
  files: ["src/core/ai/perplexity.ts"]
  errors:
    - "Line 15: 'unused variable preset'"
    - "Line 22: 'array-type should be T[] not Array<T>'"
  fix:
    - "Remove unused parameter"
    - "Convert Array<T> → T[] syntax"
  risk_level: "low"
  action: "auto_apply"

# mobile-qa agent çalıştı, test failure
Suggestion:
  type: "test-failure-analysis"
  test: "TechnicalServiceFormScreen.test.tsx"
  failure: "Repair estimate button not rendering"
  root_cause: "Missing PerplexityAnswer type import"
  fix:
    - "Add import { PerplexityAnswer } from '../../../core/ai/perplexity'"
  risk_level: "medium"
  action: "manual_approval"
```

### **2. Risk Classification**

**Low-Risk (Auto-Apply):**
- ✅ Eslint fixes (semicolons, spacing, quotes)
- ✅ Prettier formatting
- ✅ Unused variable removal
- ✅ Type annotation standardization
- ✅ Import statement cleanup
- ✅ Dependency version bumps (patch level)
- ✅ Comment updates

**Medium-Risk (Manual Review):**
- ⚠️ Logic fixes (need code understanding)
- ⚠️ Test file modifications
- ⚠️ Configuration changes
- ⚠️ API signature changes

**High-Risk (Always Manual):**
- 🔴 Security patches (must review impact)
- 🔴 Breaking changes
- 🔴 Database schema changes
- 🔴 Authentication/authorization logic
- 🔴 Payment/billing logic

### **3. Auto-Fix Workflow**

```
Agent finds error
  ↓
Generate fix suggestion
  ↓
Risk level = ?
  ├─ Low: Auto-apply
  │   ├─ Create commit
  │   ├─ Test again
  │   └─ Report success
  │
  ├─ Medium: Queue for review
  │   └─ Show in dashboard
  │
  └─ High: Manual only
      └─ Report suggestion
```

### **4. Learning System Upgrades**

Faz 3'te: "Bu aracı ne kadar sürede bittiğini track edelim"

Faz 4'te: "Bu error'u geçmiş 10 committe kaç kez gördük? Çözüm ne idi?"

```
Learning Database:
├── Seen Errors: {type, frequency, solution}
├── Agent Ordering: {optimal_sequence_per_file_type}
├── Fix Success Rate: {fix_type, success_percent}
└── Regression Prevention: {pattern, trigger, fix}
```

---

## 📋 Implementation Plan

### **Phase 4a: Suggestion Engine Core** (1 session)
- [ ] Suggestion schema define (JSON structure)
- [ ] Generate suggestions for each agent type
- [ ] Risk classifier implement
- [ ] Store suggestions in `.claude-flow/suggestions/`

### **Phase 4b: Auto-Apply Logic** (1 session)
- [ ] Low-risk detection
- [ ] Commit generation (auto-format fixes)
- [ ] Test re-run after auto-apply
- [ ] Rollback if tests fail

### **Phase 4c: Learning Integration** (1 session)
- [ ] Link suggestions to learning system
- [ ] Pattern recognition (seen this before)
- [ ] Predict next likely error
- [ ] Confidence scoring

### **Phase 4d: Dashboard Display** (1 session)
- [ ] Show pending suggestions
- [ ] Risk level indicators
- [ ] One-click approve/reject
- [ ] Audit log (what was auto-applied)

---

## 🔄 Suggestion Example Flow

### **Scenario: Mobile Developer yapar typo**

```typescript
// src/core/ai/perplexity.ts (yanlış yazıldı)
const results: Array<PerplexityAnswer> = await fetch(...);  // ❌ Should be: PerplexityAnswer[]
```

**Faz 4 Workflow:**

```
1. Developer commits
   git commit -m "feat: add caching"

2. Agents run:
   - code-quality → TypeScript check → ERROR
   - "Array<T> should be T[] (line 42)"

3. Suggestion Engine:
   {
     "type": "typescript-fix",
     "severity": "low",
     "file": "src/core/ai/perplexity.ts",
     "suggestion": "Change Array<PerplexityAnswer> → PerplexityAnswer[]",
     "auto_apply": true,
     "confidence": 0.99
   }

4. Auto-Fix:
   - Suggestion applied
   - Tests re-run
   - Report updated
   - ✅ Success

5. Dashboard:
   Branch: feature/fix-typo
   Status: ✅ FIXED (auto-applied)
   Suggestion: "Array type syntax - fixed"
```

### **Scenario: Test Failure (Medium Risk)**

```typescript
// src/features/listings/screens/ListingDetailScreen.tsx
<Pressable onPress={handlePriceConsultant}>
  {isLoadingPrice ? ... : <Text>{priceConsultant.answer}</Text>}  // ❌ null check missing
</Pressable>
```

**Workflow:**

```
1. mobile-qa runs test
   → Runtime error: "Cannot read property 'answer' of null"

2. Suggestion Engine:
   {
     "type": "nullcheck-fix",
     "severity": "medium",
     "root_cause": "priceConsultant can be null, no guard",
     "suggestion": "Add null check before accessing .answer",
     "auto_apply": false,
     "requires_approval": true
   }

3. Dashboard Shows:
   🟡 PENDING APPROVAL: "Add null check in ListingDetailScreen"
   Suggestion: "if (priceConsultant) { ... }"
   Risk: Medium

4. Developer Reviews:
   ✅ Approve
   or
   ❌ Reject (with comment)

5. If Approved:
   - Auto-apply fix
   - Test re-run
   - Merge to main (pending final review)
```

---

## 🧠 Learning System Enhancements

### **Pattern Detection**

```
Mobile team pattern detected:
- Error: "Cannot read property of undefined"
- Frequency: 5 commits in last 2 weeks
- Files affected: [ListingDetailScreen, TechnicalServiceFormScreen]
- Root cause: Type safety gaps

Recommendation:
- Increase TypeScript strictness
- Add additional type guards
- Auto-suggest null checks
```

### **Predictive Analysis**

```
File: src/features/listings/screens/ListingDetailScreen.tsx
- Similar errors in past: 8
- Confidence of next error: 65%
- Likely issue: State management in useEffect
- Suggested fix: Add dependency array check

Action: Flag as "high-risk" area, run extra tests
```

---

## 🎯 Faz 4 Success Metrics

| Metrik | Target | Yararı |
|--------|--------|--------|
| **Auto-Fix Rate** | 40-50% of issues | Zaman kazanç |
| **Fix Success Rate** | >95% | Low false positives |
| **Manual Review Time** | 50% reduction | Dev velocity artış |
| **Regression Prevention** | <2% re-failures | Quality |
| **Learning Accuracy** | >85% pattern match | AI improves |

---

## 🚀 Expected Timeline

```
Faz 4a (Suggestion Engine):     1 session  (~1-2 hours)
Faz 4b (Auto-Apply Logic):      1 session  (~1-2 hours)
Faz 4c (Learning Integration):  1 session  (~1-2 hours)
Faz 4d (Dashboard UI):          1 session  (~1-2 hours)
Testing & Tuning:               1 session  (~1-2 hours)
                               ──────────
TOTAL:                          5 sessions (~8-10 hours)
```

---

## 🔐 Safety Gates

✅ **Never Auto-Apply:**
- Security-related changes
- Database migrations
- Auth/payment logic
- Breaking API changes
- Delete operations

✅ **Always Require Approval:**
- Multi-file changes
- Logic modifications
- Dependency major version bumps

✅ **Audit Trail:**
- Every auto-apply logged
- Who approved what
- When rollback happened
- Why suggestion was rejected

---

## 📊 Dashboard Enhancements

Current (Faz 3):
```
├─ Project Status
├─ Cross-Project Dependencies
├─ Shared Metrics
└─ Learning System
```

New (Faz 4):
```
├─ Project Status
├─ Pending Suggestions (with Risk Badges)
├─ Auto-Apply History
├─ One-Click Approval Panel
├─ Cross-Project Dependencies
├─ Shared Metrics
└─ Learning System (with Predictions)
```

---

## 🎊 Faz 4 Neden Önemli?

**Şu andan Faz 4'e:**

| Süreç | Faz 3 | Faz 4 |
|-------|-------|-------|
| **Lint Error** | Report → Dev fix → Commit | Auto-fixed immediately ✅ |
| **Type Error** | Report → Dev fix → Commit | Auto-fixed immediately ✅ |
| **Test Failure** | Report → Dev debug → Commit | Suggestion → Manual approval |
| **Security CVE** | Report → Manual review | Suggestion + Risk analysis |
| **Regression** | Oops, deployed twice | Learning prevented it |

**Sonuç:** Dev velocity 30-40% artış, fewer back-and-forths

---

## ✅ Hazırlık Kontrol Listesi

- ✅ Faz 3 altyapısı kurulu
- ✅ Master orchestration active
- ✅ Cross-project dependencies working
- ✅ Learning system ready
- ✅ Dashboard port reserved
- ✅ Feature branches workflow validated

**Faz 4 için hazırız!** 🚀

---

**Planned by:** Claude Haiku 4.5  
**Phase:** Faz 4 Planning  
**Next Action:** User approval → Faz 4a start (Suggestion Engine Core)  
**Status:** 🎯 Ready for autonomous decision-making era
