# Faz 3 Planning — Web + Mobile Unified Orchestration

**Tarih:** 2026-09-19  
**Durum:** 🎯 Planning Phase  
**Scope:** Multi-project automation coordination

---

## ✅ Faz 1 & 2 Tamamlandı

| Faz | Yapılan | Durum |
|-----|---------|-------|
| **Faz 1** | Commit-triggered automation (Lint → Test → Security → Build) | ✅ |
| **Faz 2A** | Perplexity Agent API (Ürün fiyat, Tamir masrafı) | ✅ |
| **Faz 2B/C/D** | Full Autonomous orchestration (7 agents, smart routing) | ✅ |

---

## 🎯 Faz 3: Web + Mobile Unified System

### **Problem:**
- dusukbutce-web'de Faz 1 (basic pipeline)
- dusukbutce-mobile'de Faz 2 (full autonomous)
- **İkisini koordine etmek gerek**

### **Çözüm: Unified Orchestration Hub**

```
┌────────────────────────────────────────────┐
│   Unified ECC Dashboard (Master)           │
│   - Both projects' status                  │
│   - Cross-project dependencies             │
│   - Shared metrics & learning              │
└────────────────────────────────────────────┘
         ↗︎                    ↖︎
┌─────────────────┐      ┌──────────────────┐
│ dusukbutce-web  │      │ dusukbutce-mobile│
│ (Faz 1)         │      │ (Faz 2 Full Auto)│
├─────────────────┤      ├──────────────────┤
│ Basic Pipeline: │      │ 7 Autonomous     │
│ - Lint          │      │ - Perplexity     │
│ - Test          │      │ - Humanizer      │
│ - Security      │      │ - Code Quality   │
│ - Build         │      │ - QA             │
│ - Report        │      │ - Security       │
│                 │      │ - Build          │
│ → Upgrade to    │      │ - Playwright     │
│   Faz 2 Auto    │      │                  │
└─────────────────┘      └──────────────────┘
```

---

## 📋 Faz 3 Bileşenleri

### **1. Web Project Upgrade (Faz 2B'ye)**

**Yapılacak:**
- `.ecc/agent-routing.yaml` (web-specific)
- Enhanced post-commit hook
- Dashboard integration
- Learning system setup

**Aynı 7 agent'ı web'de de kurmalıyız:**
```yaml
- perplexity-validator (API testing)
- humanizer (documentation polish)
- code-quality (Next.js-specific linting)
- backend-qa (API tests, integration)
- security-scanner (Node.js dependencies)
- build-optimizer (Next.js bundle)
- load-tester (performance baseline)
```

**Timeline:** Parallel, ~1-2 sessions

---

### **2. Master ECC Configuration**

**File:** `/Users/ozan.cidik/.ecc/master-orchestration.yaml` (user-level)

```yaml
projects:
  - name: "dusukbutce-web"
    path: "~/Desktop/dusukbutce-web"
    branch: "main"
    agents: [perplexity-validator, code-quality, backend-qa, security-scanner]
    
  - name: "dusukbutce-mobile"
    path: "~/Desktop/dusukbutce-mobile"
    branch: "main"
    agents: [all 7]

cross_project_dependencies:
  - trigger: "mobile:perplexity-validator:success"
    action: "web:run-api-integration-tests"
    reason: "Perplexity integration needs API validation"
  
  - trigger: "web:security-scanner:vulnerability-found"
    action: "mobile:security-scanner"
    reason: "Shared dependencies (npm packages)"

unified_dashboard:
  port: 8765
  features:
    - real-time status (both projects)
    - shared metrics
    - cross-project dependency graph
    - unified learning system
```

---

### **3. Shared Metrics & Learning**

**Central Store:** `~/.ecc/shared-metrics.db`

Track:
- Combined CI/CD health
- Agent performance across projects
- Shared vulnerability patterns
- Optimization recommendations

---

### **4. Unified Dashboard**

```bash
npx ecc control-pane --master --port 8765
```

Shows:
- Web project status
- Mobile project status
- Cross-project dependencies (visual graph)
- Shared metrics & trends
- Orchestration timeline

---

## 🚀 Execution Plan

### **Phase 3a: Web Upgrade (Parallel)**
```
1. Setup web project with Faz 2 config
2. Install agents (same 7 + load-tester)
3. Configure cross-project triggers
4. Test orchestration (mock runs)
```

### **Phase 3b: Master Hub**
```
1. Setup master ECC config (~/.ecc/master-orchestration.yaml)
2. Link both projects
3. Configure cross-project dependencies
4. Deploy unified dashboard
```

### **Phase 3c: Testing & Optimization**
```
1. Test both projects' agent auto-trigger
2. Verify cross-project dependency chains
3. Tune learning system (shared patterns)
4. Performance baseline
```

---

## 📊 Benefits

| Benefit | Why It Matters |
|---------|----------------|
| **Unified Status** | See both projects' health in one place |
| **Shared Learning** | Patterns from web improve mobile, vice versa |
| **Cross-Project CI** | API changes in web trigger mobile tests |
| **One Dashboard** | Ops team: single pane of glass |
| **Shared Metrics** | Combined CI/CD health scoring |

---

## 📈 After Faz 3

### **Faz 4: Autonomous Decisions**
- Agents suggest fixes automatically
- Auto-apply low-risk changes (formatting, updates)
- Manual approve high-risk changes

### **Faz 5: ML-Driven Optimization**
- Predictive agent ordering
- Smart retry strategies
- Resource allocation optimization

### **Faz 6: Multi-Service Orchestration**
- Add backend services
- Microservice coordination
- Distributed deployment

---

## 📝 Faz 3 Milestones

```
[1] Web project agent setup          (Session 1-2)
[2] Cross-project dependency config  (Session 2-3)
[3] Master dashboard deployment      (Session 3-4)
[4] End-to-end testing              (Session 4)
[5] Optimization tuning             (Session 5)
```

---

## 🎯 Next Immediate Action

1. ✅ Switch to dusukbutce-web repo
2. ✅ Apply Faz 2 config (agent-routing.yaml, orchestration-setup.sh)
3. ✅ Test orchestration
4. ✅ Link projects (master config)
5. ✅ Deploy unified dashboard

---

**Ready for Faz 3 execution?** 🚀
