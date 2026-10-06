# Simülatör QA raporu — bize-sat formları (2026-10-06)

Ortam: iPhone 17 Pro simülatörü (iOS 26.1), Expo Go, Metro `EXPO_PUBLIC_API_BASE_URL=http://localhost:3111`. Backend: web `main` (`71830db`, e-posta + alan düzeltmeleri dahil) **izole** ortamda — bellekte MongoDB (`mongodb-memory-server`, port 27099), projenin `scripts/seed-e2e.js` kullanıcıları, sahte `GMAIL_*`/`BLOB_*`. Prod veritabanına, gerçek posta kutusuna ve blob deposuna erişim yok. Test sonunda tüm süreçler kapatıldı; veri bellekteydi, kalıcı kayıt yok.

## Sonuç özeti
⚠️ **Kısmi.** Formlar ve gönderim yolu çalışıyor, ama **uygulama `main`'den olduğu gibi derlenmiyor** (aşağıda, P0).

## P0 — Uygulama paketlenemiyor (`main`)
`iOS Bundling failed`: `app/listings/[id].tsx` → `ListingDetailScreen.tsx` → `src/core/ai/perplexity.ts` → `perplexityai` → `puppeteer` → Node `os`. React Native Node standart kütüphanesini içermez; **Metro paketi üretemez, uygulama açılmaz.**
- Ayrıca `PERPLEXITY_API_KEY` istemcide `process.env`'den okunuyor; `EXPO_PUBLIC_` ön eki olmadığı için pakette boş kalır (özellik çalışmaz), ön ek eklenirse **API anahtarı uygulamaya gömülür** (sızıntı). Doğru tasarım: çağrıyı web backend'inde bir uç noktaya taşımak.
- `.claude/issues/2026-10-06-perplexity-bundle.md` olarak kaydedildi. **Düzeltilmedi** (ürün kararı: özellik backend'e mi taşınacak, kaldırılacak mı?).
- Test için yalnızca yerel, commit'lenmeyen bir Metro takma adı (`perplexityai` → boş stub) kullanıldı ve geri alındı.

## Test adımları
| # | Adım | Beklenen | Gerçekleşen | Durum |
|---|---|---|---|---|
| 1 | Giriş (`test@example.com`) | Ana sayfa, kategoriler | `POST /api/auth/login 200`, `GET /api/listings 200` | ✅ |
| 2 | Telefon formu görünümü | Marka*/Model*/Kozmetik*/Depolama*/Kayıt Türü* zorunlu; RAM opsiyonel; Kozmetik 4 kademe; hesap kilidi/parça/Face ID alanları; ekran boyutu yok | Birebir | ✅ |
| 3 | Boş formu gönder | Uyarı, sunucuya istek yok | "Şu alanlar zorunludur: Marka, Model, Kozmetik Durum, Depolama, Kayıt Türü" (RAM yok), `POST /api/submissions` = 0 | ✅ |
| 4 | Telefon doldur (RAM boş) ve gönder | Kayıt oluşur | `TLP-2026-000001`; DB: `category: cep-telefonu`, `cosmeticCondition: İyi`, `storage: 128GB`, `registrationType: Yurtdışı`, `accountLock: Kapalı`, `biometricWorking: Evet`, `ram` yok | ✅ |
| 5 | Tarayıcı formu görünümü | Türkçe tip değerleri, "USB (sürüm bilinmiyor)", ADF | Birebir | ✅ (gönderilmedi) |
| 6 | Xbox formu görünümü | Ortak Marka/Model **yok**; Xbox Modeli*, Kullanım Durumu*; Kol Sayısı 1–4 | Birebir | ✅ |
| 7 | Xbox doldur ve gönder | `brand: Microsoft`, model seçiciden | `TLP-2026-000002`; DB: `brand: Microsoft`, `model: Xbox Series X`, `condition: Çok İyi`, `cosmeticCondition: Orta`, `controllers: 2`, `stickDrift: Evet` | ✅ |

## Test edilmeyenler
Yazıcı/fotokopi formları (aynı gönderim kodu; yalnızca görünüm doğrulanmadı), PlayStation ve diğer ~17 kategori, görsel yükleme (`/api/upload` sahte token), Android, gerçek cihaz, admin panelinde mobile kayıtlarının görünümü (web tarafı ayrıca tarayıcıda doğrulandı).

## Araç notları
- Simülatör klavyesi `tr_TR` iken `text` aracı noktalama yazarken yanlış karakter üretti (`@`→`'`, `.`→`ç`); test süresince yalnızca `en_US` bırakıldı, sonunda eski ayar geri yüklendi.
- `exp://…/--/sell/playstation` derin bağlantısı açık oturumu yönlendirmedi; gezinme arayüzden yapıldı.

## Temizlik
Metro/web/Mongo süreçleri kapatıldı, `metro.config.js` ve stub dosyası geri alındı (`git status` temiz), simülatör klavye ayarı geri yüklendi. Prod verisine yazılmadı; test hesabı gerekmedi (izole DB).
