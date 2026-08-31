# Teknik Servis akışı — 2026-08-31

## Ne yapıldı
Anasayfadaki görsel-only "TEKNİK SERVİS" butonu ve 9 servis satırı gerçek bir akışa bağlandı.

Yeni feature: `src/features/technicalService/`
- `api/technicalServiceRepository.ts` — `POST /api/technical-service-submissions` (auth gerektirmiyor, backend'de doğrulandı).
- `data/technicalServiceOptions.ts` — randevu saat dilimleri (8 adet) ve kargo firması seçenekleri (4 adet), web ile birebir.
- `components/DeliveryMethodSheet.tsx` — servis seçildikten sonra "Evimden Al" / "Kargo ile Gönder" seçtiren modal.
- `components/PillSelectField.tsx` — randevu saati / kargo firması seçimi için pill-tarzı select.
- `screens/TechnicalServiceLandingScreen.tsx` — 9 servisin listesi (`TEKNIK_SERVIS_CATEGORIES`'ten, `homeCategories.ts`).
- `screens/TechnicalServiceFormScreen.tsx` — ad/telefon/email, il-ilçe (mevcut `PickerModal`+`TURKEY_PROVINCES` reuse), adres, cihaz bilgisi, sorun açıklaması, notlar + teslimat yöntemine göre koşullu alanlar (randevu tarihi/saati ya da kargo firması).

Route'lar: `app/(app)/teknik-servis/{index,form}.tsx` — `(tabs)` grubunun dışında, sell akışıyla aynı desende (tab bar'ın üstüne push).

`HomeScreen.tsx`: `showTeknikServisComingSoon` kaldırıldı, TEKNİK SERVİS butonu ve servis satırları artık `/teknik-servis`'e yönlendiriyor.

`endpoints.ts`: `technicalServiceSubmissions: '/api/technical-service-submissions'` eklendi.

## Kapsam dışı (bilerek yapılmadı)
Kullanıcının kendi taleplerini görebileceği bir takip ekranı yok — backend GET admin-only, web'de de böyle bir ekran yok.

## Tip/lint durumu
`npx tsc --noEmit` ve `npx expo lint` temiz.

## Test
Metro + iPhone 17 Pro Max simülatöründe gerçek deep-link ile doğrulandı: Teknik Servis landing (9 servis) → "Format Atma" seçimi → DeliveryMethodSheet (Evimden Al/Kargo ile Gönder) → "Evimden Al" seçimi → form ekranı tüm alanlarla (Ad Soyad, Telefon, Email, İl/İlçe, Adres, Cihaz Bilgisi, Sorun Açıklaması, Notlar, Randevu Tarihi, Randevu Saati pill'leri) doğru render oldu. Gerçek bir POST denemesi bu turda yapılmadı (form dolu haldeyken görsel doğrulama yeterli görüldü); backend anonim kabul ettiği için ayrı bir test hesabı/temizlik gerekmiyor.
