# [P0] Mobile uygulama paketlenemiyor: `perplexityai` → `puppeteer`

**Durum:** Açık · **Bulan:** simülatör QA (2026-10-06) · **Ciddiyet:** P0 (uygulama açılmıyor)

## Belirti
`npx expo start` sonrası `iOS Bundling failed`:
`The package at "node_modules/puppeteer/lib/cjs/puppeteer/getConfiguration.js" attempted to import the Node standard library module "os".`

## Zincir
`app/listings/[id].tsx` → `src/features/listings/screens/ListingDetailScreen.tsx` (satır 9: `import { getPriceEstimate, type PerplexityAnswer } from '../../../core/ai/perplexity'`) → `src/core/ai/perplexity.ts` → `perplexityai` (Node SDK) → `puppeteer`.

## Neden önemli
1. İlan detay ekranı bir Node SDK'sı içe aktarıyor; React Native'de çalışamaz, **tüm uygulama derlenmez**.
2. `PERPLEXITY_API_KEY`, `process.env`'den istemcide okunuyor (`src/core/ai/perplexity.ts:4`). `EXPO_PUBLIC_` ön ekiyle yayınlanırsa anahtar paketin içine gömülür.
3. `src/core/ai/` ECC/öğrenme araçlarının da klasörü; uygulama ekranı bu klasörden içe aktarım yapmamalı.

## Seçenekler (karar gerekli)
- **A (önerilen):** Fiyat danışmanı çağrısını web backend'ine (ör. `/api/price-estimate`) taşı, mobile yalnızca `apiClient` ile çağırsın; anahtar sunucuda kalsın.
- B: Özelliği (`priceConsultant`) ekrandan kaldır.
- C: `perplexityai` yerine REST + `fetch` (çalışır ama anahtar istemcide kalır, önerilmez).

## Geçici çözüm (test için, commit'lenmedi)
Metro `resolver.resolveRequest` ile `perplexityai`'yi boş sınıfa yönlendirmek.

## Tekrar üretme
`git checkout main && npm ci && npx expo start --port 8090 --ios` → paketleme hatası.
