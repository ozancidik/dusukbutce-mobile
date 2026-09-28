# Mobile ↔ web API senkron taraması (2026-09-28)

Dal: `fix/mobile-web-api-senkron` (main'den açıldı).

## Bu dalda yapılanlar

1. **`sound-system` (Hoparlör) kategorisi kaldırıldı.** `/api/sound-system-submissions` web'den silinmişti (web'de karşılığı `audio-system`, mobile'da zaten var). Mobile'da bu kategori 404'e gidiyordu. Web temizliğinde mobile çağıranlarını kontrol etmemiştim; regresyon bana ait.
2. **Kategori id'leri web ile hizalandı** (`category` olarak sunucuya gider, admin filtre/etiketleri bunlara bağlı):
   - `phone` → `cep-telefonu`
   - `photocopier` → `fotokopi-makinesi`
   - `printer` → `yazici`
   - `scanner` → `tarayici`
   Değişen yerler: `src/features/submissions/config/categoryFormConfigs.ts`, `src/features/home/data/homeCategories.ts` (`formId`). Route parametresi (`/sell/<id>`) kullanıcıya görünmüyor; başka kullanım yeri yok (grep ile doğrulandı).
3. Bayat yorum güncellendi (`registrationType` artık web'de kaydediliyor).

Doğrulama: `tsc` — `app/`, `src/features`, `src/core/network`, `src/shared` altında 0 hata. ESLint — değişen 2 dosyada 0 sorun. Cihazda/simülatörde çalıştırılmadı.

## Bilinçli olarak YAPILMAYANLAR (kapsam / onay)

- **Kozmetik durum sözlüğü uyuşmuyor:** mobile `Sıfır Gibi / Az Kullanılmış / İyi / Yıpranmış`, web `Mükemmel / İyi / Orta / Kötü`. Web'deki tam liste tüm sayfalardan doğrulanmadan değiştirilmedi.
- **`required: true` extra alanlar istemcide zorlanmıyor** (telefon: storage/ram/registrationType; desktop; playstation/xbox model; fotokopi/yazıcı/tarayıcı type).
- **PlayStation/Xbox'ta çift "Model" alanı:** ortak Model text alanı + ekstra `model` select; `...extraValues` ortak değeri eziyor.
- **ALLOWED_FIELDS dışı alanlar sessizce atılıyor:** `color`, `controllers`, `games`, `connectionType`, `printSpeed`, `copySpeed`, `scanSpeed`. Web `compatibility` alanı gaming-wheel'de mobile'da yok. Web rapor bölüm 2 kararlarıyla birlikte ele alınmalı.
- Web'de bazı yetim/ölü sayfalar Türkçe id (`kasa`, `islemci`, `sogutucu`…) ve `steering-wheel` kullanıyor; mobile bunlarla eşleşmiyor ve eşleşmesi gerekmiyor (canlı akış İngilizce id'li sayfalar).

## Sağlık taraması (kapsam dışı, düzeltilmedi)

- `tsc --noEmit` exit 2: 299 hata, hepsi `src/core/ai` (222), `src/server/__tests__` (39), `src/server/dashboard-server.ts` (38). Kök neden: `express` bağımlılığı yok. Uygulama kodunda hata yok.
- `eslint .` 392 sorun; hataların büyük kısmı `.claude/worktrees/agent-*` altındaki eski worktree kopyalarından geliyor. ESLint `ignores`'a `.claude/worktrees/**` eklenmeli.
- Jest: 51 testten 44 geçiyor; `dashboard-server.test.ts` (express yok) ve `performance-monitor.test.ts` kırık.
- `ListingDetailScreen.tsx:41`, `TechnicalServiceFormScreen.tsx:55`: kullanılmayan `error` değişkeni.

## Dokunulmayanlar

Çalışma ağacındaki `package.json`, `package-lock.json`, `CLAUDE.md`, `.claude-flow/post-commit.log`, `.nvmrc` değişiklikleri bana ait değil; commit'e dahil edilmedi.
