# Bize Sat — eksik 8 kategoriye form ekleme

Tarih: 2026-08-31
Branch: `bize-sat-eksik-kategoriler` (main'den, main = anasayfa+tab bar merge sonrası, commit 1480f23)

## Yapılan

`src/features/submissions/config/categoryFormConfigs.ts`'e mevcut config-driven desene uygun 8 yeni `CategoryFormConfig` eklendi (hepsi `endpoint: '/api/submissions'`, `responseShape: 'standard'` — web reposunda bu 8 kategori için dedicated bir route yok, hepsi `handleProductSubmission` üzerinden genel uca gidiyor). `src/features/home/data/homeCategories.ts`'teki ilgili 8 satıra `formId` eklendi, dosya başındaki açıklama yorumu güncellendi ("formId'siz kalemler" artık yok).

`SubmissionFormScreen.tsx`, `DynamicField.tsx`, `submissionsRepository.ts` dosyalarına dokunulmadı (kapsam dışı).

## Kategori bazında extraFields ve ALLOWED_FIELDS durumu

Referans: `~/Desktop/dusukbutce-web/lib/handleProductSubmission.ts` içindeki `ALLOWED_FIELDS` sabiti. Web'in kendisi de whitelist dışı alanları sessizce kaydetmiyor — bu RN entegrasyonunun hatası değil, mevcut bir backend/web tutarsızlığı, düzeltilmedi (CLAUDE.md kuralı gereği backend'e dokunulmadı).

- **phone** (Cep Telefonu, `~/Desktop/dusukbutce-web/app/bize-sat/cep-telefonu/page.tsx` + `PhoneBasicInfo.tsx`): `storage`, `ram`, `batteryHealth`, `screenSize` allowed. `color`, `registrationType` ALLOWED_FIELDS'te YOK → backend'de saklanmayacak, yine de web ile tutarlılık için formda gösterildi.
- **desktop** (Masaüstü/Kasa, `desktopConfig.ts`): `processorBrand`, `processor`, `graphicsCard`, `graphicsCardWatt`, `ram`, `ramType`, `storage`, `storageType`, `powerSupply`, `motherboard`, `case` — **hepsi ALLOWED_FIELDS'te var**, hiçbir alan düşmüyor.
- **playstation** (`playstationConfig.ts`): `model`, `storage` allowed. `color`, `controllers`, `games` ALLOWED_FIELDS'te YOK. `accessories` allowed.
- **gamepad** (`gamepadConfig.ts`): `model`, `condition` allowed (`condition` whitelist'te var). `color` YOK. `accessories` allowed.
- **xbox** (`xboxConfig.ts`): playstation ile aynı durum — `model`, `storage`, `accessories` allowed; `color`, `controllers`, `games` YOK.
- **photocopier** (Fotokopi Makinesi, `PhotocopierTechnicalSpecs.tsx`): `type`, `resolution` allowed. `connectionType`, `copySpeed`, `color` YOK.
- **printer** (Yazıcı, `PrinterTechnicalSpecs.tsx`): `type`, `resolution` allowed. `color`, `connectionType`, `printSpeed` YOK.
- **scanner** (Tarayıcı, `ScannerTechnicalSpecs.tsx`): `type`, `resolution` allowed. `connectionType`, `scanSpeed` YOK.

Not: `keyboardType: 'numeric'` `batteryHealth` (phone) ve `controllers` (playstation/xbox) alanlarına eklendi çünkü web'de bunlar `type: 'number'` idi; RN'in DynamicField'ında ayrı bir number tipi yok, mevcut desende (`FieldType`) olduğu gibi `text` + `keyboardType: 'numeric'` kullanıldı (notebook config'indeki gibi bir örnek yoktu ama processor/graphics-card configlerinde de sayısal alanlar düz `text` — precedent'e uydum, `keyboardType` eklemek küçük bir iyileştirme, mevcut FieldConfig tipinde zaten var olan bir alan).

## Doğrulama

- `npx tsc --noEmit`: temiz.
- `npx expo lint`: temiz.
- Metro (`npx expo start --port 8090`) başlatıldı, zaten booted olan "iPhone 17 Pro Max" simülatöründe Expo Go üzerinden `exp://.../--/sell/<formId>` deep link'leriyle 5 kategori (phone, desktop, playstation, photocopier, scanner) açılıp ekran görüntüsüyle doğrulandı — tüm extraFields'ler doğru render oluyor, marka/model/kozmetik-durum/garanti/kutu/fatura/açıklama/resim gibi sabit alanlar da yerinde. Anasayfada 8 kategorinin hiçbirinde artık "Yakında" rozeti görünmüyor (ekran görüntüsüyle doğrulandı). Kalan 3 kategori (gamepad, xbox, printer) aynı ispatlanmış config-driven pattern'i kullandığı için ayrıca ekran görüntüsü alınmadı, ancak `getCategoryFormConfig` id eşleşmesi ve tip kontrolü zaten doğrulandı.
- Metro process test sonunda durduruldu (`pkill -f "expo start --port 8090"`).

## Değişen dosyalar

- `src/features/submissions/config/categoryFormConfigs.ts`
- `src/features/home/data/homeCategories.ts`

## Açık issue

`.claude/issues/` altında bu görevle ilgili açık bir kayıt bulunamadı (dizin mevcut değil / boş).

## Kapsam dışı gözlemler (kod değiştirilmedi, sadece not)

- Web'in `cep-telefonu/page.tsx.backup-20251024-141601` gibi eski bir yedek dosyası var; bu web reposuna ait, mobil tarafını ilgilendirmiyor.
- `registrationType`, `color`, `controllers`, `games`, `connectionType`, `printSpeed`, `copySpeed`, `scanSpeed` alanlarının ALLOWED_FIELDS whitelist'ine eklenmesi backend tarafında yapılması gereken bir iyileştirme olurdu (kullanıcı doldurup gönderiyor ama sunucu bu alanları kaydetmiyor) — görev talimatına göre buna dokunulmadı, sadece burada not düşülüyor.
