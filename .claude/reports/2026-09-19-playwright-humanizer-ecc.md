# Playwright MCP + Humanizer + ECC Installation

**Tarih:** 2026-09-19  
**Durum:** ✅ Kuruldu (ECC setup pending)  
**Branch:** `feature/playwright-humanizer-ecc`  
**Commit:** `123a64d`

---

## Kurulu Araçlar

### 1. Playwright MCP (`@playwright/mcp@0.0.82`)
- **Amaç:** Browser automation via LLM — Claude/AI agents web interaction
- **Kullanım:** LLM prompts'ta: `@playwright navigate to ...`, `@playwright click button`
- **Durum:** ✅ Ready
- **İçin:** Web testing, automated browser interactions, Faz 3+
- **NOT:** Mobile app'te doğrudan kullanılmaz; CI/test scripts'te faydalı

### 2. Humanizer Skill (`.agents/skills/humanizer/`)
- **Amaç:** AI-generated text → human-readable dönüşüm
- **Kullanım:** `/humanizer` slash command + text
- **Durum:** ✅ Ready
- **Örnek:** 
  ```
  /humanizer
  [Perplexity cevaplarını yapıştır]
  ```
- **Fayda:** UI text'lerini doğallaştırma, system mesajları humanize
- **İçin:** UI polish (Faz 3)

### 3. ECC (ecc-universal@2.2.1 + ecc-agentshield@1.6.0)
- **Amaç:** Multi-agent orchestration — Web + Mobile pipeline coordination
- **Komutlar:**
  ```bash
  npx ecc control-pane          # Local operator dashboard
  npx ecc list-installed        # Installed components
  npx ecc doctor                # Diagnose state
  npx ecc status                # State store status
  ```
- **Durum:** ✅ Packages installed, ⏳ Setup pending
- **İçin:** **FAZ 2B — Web/Mobile Unified Orchestration**

---

## Kurulum Detayları

| Paket | Version | Tip | Durum |
|-------|---------|-----|-------|
| `@playwright/mcp` | 0.0.82 | npm | ✅ Ready to use |
| Humanizer | local | skill | ✅ Ready (`/humanizer`) |
| `ecc-universal` | 2.2.1 | npm | ✅ Ready |
| `ecc-agentshield` | 1.6.0 | npm | ✅ Ready |
| **ECC setup** | - | CLI | ⏳ Pending (hooks config) |

---

## Sonraki Adım: ECC Setup

**User'ın terminalinde çalıştırması gerekiyor:**

```bash
cd /Users/ozan.cidik/Desktop/dusukbutce-mobile
npx ecc setup --mode claude-plugin --scope user --hooks standard --yes
```

**Ne yapıyor:**
- Git hooks konfigürasyonu (post-commit vb)
- Claude plugin entegrasyonu
- ECC operator console'u hazırlanıyor

**Alternatif (Interactive):**
```bash
npx ecc setup
# Wizard'ı takip et
```

---

## Hazırlık: Faz 2B

**ECC setup tamamlandıktan sonra:**

### A. Web Pipeline + Mobile Pipeline → ECC Orchestrator
```bash
npx ecc install --profile core --target claude
```

### B. Unified Dashboard
```bash
npx ecc control-pane --port 8765
# http://localhost:8765'te açılır
```

### C. Cross-Project State
```bash
npx ecc memory init
# Web + Mobile state sharing başlat
```

---

## Dosyalar

| Path | Tip | Açıklama |
|------|-----|----------|
| `.agents/skills/humanizer/` | NEW | Humanizer skill (local) |
| `package.json` | UPDATED | +ecc-universal, +ecc-agentshield, +@playwright/mcp |
| `package-lock.json` | AUTO | Dependency lock |

---

## Kullanım Örnekleri

### Humanizer (UI Polish)
```bash
/humanizer

Here's my writing sample:
[senin stil örneği]

Now humanize this:
"Eksik bilgi: Ad soyad, telefon ve adres zorunludur."
```

→ Çıkmazı: "Maalesef, tamamlanması gereken bilgiler var: adın, telefon numarası ve adresin bize ihtiyaç."

### Playwright (CI/Test)
```bash
# GitHub Actions workflow'ta
npx @playwright/mcp navigate "https://dusukbutce.com"
npx @playwright/mcp click ".add-to-cart"
```

### ECC Control Pane
```bash
npx ecc control-pane
# Local dashboard → Web + Mobile orchestration görüş
```

---

## Notlar

- **Playwright:** Mobile app'te değil, web/testing için
- **Humanizer:** Opsiyonel polish — core'a değil
- **ECC:** **Faz 2B'nin kalbi** — Web/Mobile coordination
- **Hooks:** ECC setup user approval'ı gerektirir (git hook'ları)

---

**Raporlayan:** Claude Haiku 4.5  
**Branch:** Feature → Review → Merge to main  
**ECC Waitlist:** Setup komutu for user
