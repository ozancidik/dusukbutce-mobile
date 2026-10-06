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
