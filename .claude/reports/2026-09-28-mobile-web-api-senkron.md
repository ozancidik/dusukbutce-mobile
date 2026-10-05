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

4. **Kozmetik durum sözlüğü web ile hizalandı:** `Mükemmel / İyi / Orta / Kötü` (web bize-sat sayfalarının 19-21'inde ortak; `Çok İyi` yalnızca 3 sayfada, şemada enum yok). Eski mobile değerleri (`Sıfır Gibi`, `Az Kullanılmış`, `Yıpranmış`) admin tarafında tanınmıyordu.
5. **`required: true` extra alanlar artık istemcide zorlanıyor.** Eksikler tek uyarıda listeleniyor; zorunlu alan etiketlerine `*` eklendi (Marka/Model/Kozmetik Durum dahil). Mantık saf fonksiyona çıkarıldı: `src/features/submissions/validation.ts` (`getMissingFields`).
6. **PlayStation/Xbox çift "Model" sorunu çözüldü:** config'e `fixedBrand` eklendi (PlayStation `Sony`, Xbox `Microsoft`); kendi `model` select'i olan kategorilerde ortak Marka/Model kutuları gizleniyor ve model o select'ten gönderiliyor. Web'de PlayStation `brand: 'Sony'`, Xbox `brand: 'xbox'` gönderiyor; Xbox'ta küçük harfli `xbox` yerine `Microsoft` seçtim (web ile tek fark, admin listesinde marka görünümü).

Doğrulama: `tsc` uygulama kodunda 0 hata; ESLint 0 sorun. Geçici jest testiyle 6 durum doğrulandı (id benzersizliği/hizası, sound-system yok, kozmetik liste, telefon zorunlu alanları, PlayStation marka+model, boşluk-only değerler); test dosyası commit'lenmedi çünkü jest ayarı ve `@types/jest` yalnızca commit'lenmemiş `package.json`'da. Cihazda/simülatörde çalıştırılmadı.

7. **Bize-sat raporu bölüm 2 ile hizalama:** renk/oyunlar formdan çıkarıldı; `connectionType` → `connectivity`, `copySpeed` → `speed`, yazıcı rengi → `printColor`; `printSpeed`/`scanSpeed` çıkarıldı; gaming-wheel'e zorunlu `compatibility` (Bilgisayar/Playstation/Xbox/Bilgisayar+Playstation/Bilgisayar+Xbox) eklendi.
8. **Bölüm 3 ile hizalama (web'deki yeni alanlar):** telefon (`accountLock`, `partReplaced`, `biometricWorking`), tablet (`accountLock`), işlemci (`pinDamage`), SSD (`driveHealth`), mouse (`clickIssue`), PlayStation/Xbox (`stickDrift`; `controllers` 1-4 seçici), gamepad (`stickDrift`), direksiyon (`pedal`, `shifterIncluded`, `forceFeedback`), yazıcı/fotokopi (`pageCount`), soğutucu (`mountingKit`), monitör/notebook (`screenStatus`, `deadPixelCount`).

9. **Bölüm 3 kalan alanlar ve form hataları (web `70f03c6` ile hizalı):** notebook (şarj adaptörü, klavye düzeni, bilinen arıza), masaüstü (bilinen arıza; disk tipi `SSD(NVMe)` biçimi), işlemci (overclock), RAM (kit), monitör (aksesuar; çözünürlük/yenileme/panel seçici), klavye (eksik tuş), kulaklık (tip, mikrofon, ped, şarj kutusu), soğutucu (pompa; tip seçenekleri), kasa (yan panel, fan; güç kaynağı Var/Yok + watt), PlayStation (jailbreak, firmware), PS/Xbox/gamepad **Kullanım Durumu (web'de zorunlu)**, gamepad pil, tablet (aksesuar, ekran, ölü piksel; depolama seçici), ses sistemi (tip, kumanda/kablo), yazıcı/fotokopi (toner; ADF), tarayıcı (ADF, kullanım; Türkçe tip değerleri), SSD (`type` form faktörü, `interface` serbest metin), mouse (bağlantı seçenekleri), telefon (RAM opsiyonel, ekran boyutu çıkarıldı).

10. **Yazıcı/fotokopi ayrıştırması (web `1e3fd28`):** yazıcı `type` yalnızca teknoloji + `multifunction`/`paperSize`/`usageType`; fotokopi `type` → `printColor` (Renk Modu) + aynı üç alan.

Değişmezlik kontrolü (elle çalıştırıldı): mobile config'teki tüm `key` değerleri web `lib/handleProductSubmission.ts` `ALLOWED_FIELDS` içinde; kategori içinde çift anahtar yok. **Önemli:** mobile bu alanları göndermeden önce web dalı (`feat/bize-sat-alan-temizligi`) prod'a çıkmalı; o zamana kadar yeni alanlar sunucuda sessizce atılır (gönderim hata vermez).

## Bilinçli olarak YAPILMAYANLAR (kapsam / onay)

- Yeni alanların hiçbiri zorunlu değil (web'de de değil); telefon/tablet `accountLock` için zorunlu yapmak ayrı karar.
- Bölüm 4-5 (kozmetik varsayılanı, ölü admin alanları, kategori adı tutarsızlığı, yazıcı tip listesinin ayrıştırılması) yapılmadı.
- Web'de bazı yetim/ölü sayfalar Türkçe id (`kasa`, `islemci`, `sogutucu`…) ve `steering-wheel` kullanıyor; mobile bunlarla eşleşmiyor ve eşleşmesi gerekmiyor (canlı akış İngilizce id'li sayfalar).

## Sağlık taraması (kapsam dışı, düzeltilmedi)

- `tsc --noEmit` exit 2: 299 hata, hepsi `src/core/ai` (222), `src/server/__tests__` (39), `src/server/dashboard-server.ts` (38). Kök neden: `express` bağımlılığı yok. Uygulama kodunda hata yok.
- `eslint .` 392 sorun; hataların büyük kısmı `.claude/worktrees/agent-*` altındaki eski worktree kopyalarından geliyor. ESLint `ignores`'a `.claude/worktrees/**` eklenmeli.
- Jest: 51 testten 44 geçiyor; `dashboard-server.test.ts` (express yok) ve `performance-monitor.test.ts` kırık.
- `ListingDetailScreen.tsx:41`, `TechnicalServiceFormScreen.tsx:55`: kullanılmayan `error` değişkeni.

## Dokunulmayanlar

Çalışma ağacındaki `package.json`, `package-lock.json`, `CLAUDE.md`, `.claude-flow/post-commit.log`, `.nvmrc` değişiklikleri bana ait değil; commit'e dahil edilmedi.
