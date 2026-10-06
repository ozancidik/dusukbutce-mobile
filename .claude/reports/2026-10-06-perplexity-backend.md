# Perplexity çağrısının backend'e taşınması — mobile (2026-10-06)

Çözülen: `.claude/issues/2026-10-06-perplexity-bundle.md` (P0: uygulama paketlenemiyor; PR #5'te kayıtlı).

## Değişiklik
- `ListingDetailScreen` (Fiyat Danışmanı) ve `TechnicalServiceFormScreen` (Tamir Tahmini) artık `src/features/ai/api/estimatesRepository.ts` üzerinden web `POST /api/ai/estimate`'i çağırır (`apiClient`, Bearer token).
- Hata durumunda repository özel durum fırlatmaz; backend'in Türkçe mesajını (429 çok fazla deneme, 503 kullanılamıyor, 502 ulaşılamadı) `status: 'error'` olarak döndürür, ekranlardaki mevcut hata kartı gösterir.
- Silindi: `src/core/ai/perplexity.ts` ve iCloud kopyası `perplexity 2.ts` (**ikisi de izleniyordu**), `perplexityai` bağımlılığı; kilit dosyasından `puppeteer` ağacı da çıktı (−579 satır, postinstall'da Chromium indirmesi de kalkar).
- `src/core/ai/ecc-integration.ts` içindeki `'src/core/ai/perplexity.ts'` dizgeleri yalnızca sahte rapor verisi; dokunulmadı.

## Doğrulama
`tsc` 0 hata · `eslint` 0 hata · `jest` 74/74 (yeni `estimatesRepository.test.ts` 10 test) · `npm ci` temiz. (Bu dizinin `node_modules`'ü #3 öncesinden kalmaydı; `npm ci` ile kilide göre senkronlandı.)

## Bağımlılık / yayın sırası
Web PR'ı (`/api/ai/estimate`) prod'a çıkmadan bu PR yayınlanmamalı; aksi halde iki özellik "geçersiz uç" hatası verir. Web'de `PERPLEXITY_API_KEY` tanımlanmazsa uç 503 döner ve ekranlar "kullanılamıyor" der (uygulama bozulmaz).

## Doğrulama sonuçları (izole ortam: bellekte MongoDB, sahte e-posta/blob, gerçek Perplexity anahtarı YOK)
| Kontrol | Sonuç |
|---|---|
| **P0:** `expo start` ile paketleme, takma ad/stub **olmadan** | ✅ `iOS Bundled … (1515 modül)`; `PERPLEXITY_API_KEY` uyarısı da kayboldu |
| **Tüm 22 kategori, uçtan uca** (`scripts/qa/kategori-e2e.ts`: gerçek config + `getMissingFields` + gerçek uç + DB doğrulaması) | ✅ 22/22: istemci doğrulaması geçti, her ekstra alan DB'de doğru değerle, kategori/marka/model doğru |
| Betiğin kendini doğrulaması (negatif kontrol: izin listesinde olmayan sahte alan eklenince) | ✅ 0/22, "kayıp alan: [sahteAlan]" |
| `POST /api/ai/estimate` kimliksiz / giriş yapmış+anahtarsız / geçersiz gövde | ✅ 401 / 503 "Bu özellik şu anda kullanılamıyor" / 400 |
| `POST /api/upload` sahte blob tokenı / kimliksiz | 500 "Görsel yüklenemedi" / 401 (beklenen) |
| Önceki turda simülatörde: giriş, telefon (boş/dolu gönderim), Xbox, tarayıcı formu | ✅ (bkz. `2026-10-06-simulator-qa.md`, PR #5) |

## Doğrulanamayanlar (dürüst liste)
- **Fiyat Danışmanı / Tamir Tahmini ekranları simülatörde görülmedi.** Makine yükü çok yüksekti (yük ortalaması 428: iCloud `fileproviderd` + `MediaAnalysis` + Defender; `node_modules`/repo iCloud Desktop'ta), simülatörde yazım dakikalarca gecikti ve karakter kaybetti. Ekran mantığı `estimatesRepository` jest testleri (10) ve uç noktanın gerçek sunucudaki 401/503/400 yanıtlarıyla kapsandı; ekranların JSX'i yalnızca içe aktarma ve çağrı satırı değişti.
- **Gerçek Perplexity yanıtı** (anahtar yok) ve **gerçek görsel yükleme** (gerçek blob deposuna yazmamak için) test edilmedi.
- Yazıcı/fotokopi/PlayStation formlarının **arayüzü** bu turda görülmedi; ancak yükleri ve kayıtları `kategori-e2e` ile doğrulandı.
- Android, gerçek cihaz.

## Not: `scripts/qa/kategori-e2e.ts`
Yalnızca yerel/izole backend ve Mongo'yu kabul eder (aksi halde hata fırlatır); kurulum başlıkta yazılı. Yeni kategori/alan eklendiğinde çalıştırılması önerilir.
