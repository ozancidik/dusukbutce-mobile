# Mobile altyapı düzeltmesi (2026-10-05) — PR #3

Dal: `fix/mobile-altyapi-duzeltme` (origin/main `d3e2ea7` üzerine 4 commit).

## Bulgular ve kök sebepler
| Belirti | Kök sebep |
|---|---|
| CI `Learning Orchestration` günlerdir kırmızı | `actions/upload-artifact@v3` kullanımdan kalktı; ayrıca `npm ci` kilit senkronsuzluğundan düşer |
| `npm ci` kurulmuyor | `origin/main`'de `package.json` ↔ `package-lock.json` senkron değil (react-dom, reanimated, worklets lock'ta yok, `EUSAGE`) |
| `tsc` 299 hata | 237'si jest global tipleri (`types` yok); `express`/`ws` bildirilmemiş; 5 küçük tip hatası |
| ESLint 392 sorun | `.claude/worktrees/**` kopyaları (350+); `metro.config.js` bayat disable yorumu; `express` çözümlenemiyor |
| jest 19 test kırık | `ws` geçişli v7'ye çözülüyordu (`WebSocketServer` yok); yedek testi ve kalıcılık testleri gerçek `~/.ecc`'ye bağlıydı |

## Gerçek hatalar (yalnızca "yapılandırma" değil)
1. `learning-persistence.ts`: `JSON.stringify(Map)` → `{}`; **ajan/desen/risk verisi her kayıtta siliniyordu**. Düzeltildi (Map/Date güvenli serileştirme, eski dosyalar için geriye dönük uyum).
2. Aynı dosya: yollar modül yüklenirken sabitleniyordu; testler **gerçek `~/.ecc/`'ye yazıyordu**. Yollar artık her çağrıda `HOME`'dan okunuyor.
3. `learning-orchestrator.ts`: `estimatedDuration` ↔ `estDuration` alan adı hatası (log "NaN" basıyordu).
4. "Yedekten geri yükle" testi yalnızca gerçek `~/.ecc`'deki birikmiş 100+ yedek sayesinde geçiyordu (kirlilik testi maskeliyordu).

## Sonuç (yerel, temiz `npm ci`)
`tsc` 299 → 0 · `eslint` 392 → 0 hata (39 uyarı) · `jest` 44/63 → 66/66 · Betterleaks temiz.

## Yan etki ve temizlik
- Testler gerçek `~/.ecc/`'ye yazdığı için orada 116 test artığı birikmişti (boş durum / test projesi; kimliği doğrulandı). **Silinmedi**, `/tmp/ecc-test-artifacts-quarantine/` altına taşındı (geri alınabilir). Gerçek `master-orchestration.yaml` yerinde.
- **Olay:** çalışma sırasında, `git worktree add` başarısız olduğu halde `;` ile zincirlenen `npm install` ana dizinde çalıştı ve çalışma ağacındaki commit'siz `package.json`/`package-lock.json`'a `express` ekledi. `npm uninstall` ile geri alındı; lock dosyası eski boyutuna (12578 satır fark) döndü, `package.json` yalnızca bilinen hunk'ları içeriyor, JSON geçerli. Bu dosyalar hâlâ commit'siz duruyor (içeriği PR #3'te commit'lendi).

## Doğrulanamayanlar / sıradaki
- **CI bu PR'ın kendi koşusuyla ilk kez doğrulanıyor.** Workflow Node 18 kullanıyor, `.nvmrc` yok; Expo 57 / RN 0.86 daha yeni Node ister. `npm ci` Node 18'de başarısız olursa `NODE_VERSION` yükseltilmeli.
- Mobile ekranları cihazda/simülatörde hâlâ çalıştırılmadı (mobile form akışı doğrulaması yapılmadı). İzole backend gerektirir.
- `suggestions.ts` içindeki kullanılmayan `riskMap` ve 39 ESLint uyarısı (`src/core/ai`) duruyor.
