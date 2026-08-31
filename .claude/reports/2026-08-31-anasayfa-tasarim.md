# Anasayfa - web ile görsel eşleme (2026-08-31)

Branch: `anasayfa-web-tasarim` (main'e dokunulmadı)

## Ne yapıldı

`src/features/home/HomeScreen.tsx` tamamen yeniden yazıldı; eski "profil kartı + 4 ikonluk grid" tasarımı kaldırılıp `~/Desktop/dusukbutce-web/app/page.tsx`'in mobil (`isMobile`, ≤1024px) render sırasıyla birebir eşleşen bir yapı kuruldu:

1. Amber "2. El Ürününü" banner + kırmızı ok aksanı
2. Tam genişlik yeşil "BİZE SAT" butonu → `router.push('/sell')`
3. "Kategoriler" başlığı + 21 kalemlik tek sütun Bize Sat kategori listesi (web'deki mobil sırayla birebir aynı)
4. Amber "Uzman Ekibimizden Destek Al" banner (🚚 alt metniyle) + kırmızı ok
5. "TEKNİK SERVİS" butonu (görsel amaçlı, hiçbir route'a gitmiyor)
6. "Kategoriler" başlığı + 9 kalemlik Teknik Servis listesi (tamamı görsel, linksiz)
7. Kırmızı "SATILIK İLANLAR" butonu → `router.push('/listings')`
8. Gerçek ilanlardan oluşan, `/api/listings`'ten TanStack Query ile çekilen, yatay `FlatList` + `pagingEnabled` tabanlı, 3 saniyede bir otomatik ilerleyen (dokunurken duran), altında nokta göstergeli slider

## Yeni/değişen dosyalar

- `src/features/home/HomeScreen.tsx` — yeniden yazıldı
- `src/features/home/data/homeCategories.ts` — yeni: `BIZE_SAT_HOME_CATEGORIES` (21 kalem, web'deki mobil liste sırasıyla birebir) ve `TEKNIK_SERVIS_CATEGORIES` (9 kalem)
- `src/features/home/components/ListingSlider.tsx` — yeni: ilan carousel'i, `listingsRepository.fetchListings()` + `getListingTitle()` kullanıyor (yeni repository/model yazılmadı, mevcut olanlar tüketildi)
- `src/shared/widgets/SectionBanner.tsx` — yeni paylaşılan widget: amber gradient banner + kırmızı ok aksanı (web'de iki yerde tekrar ettiği için çıkarıldı)
- `src/shared/widgets/CategoryListItem.tsx` — yeni paylaşılan widget: ikon+isim satırı (Bize Sat ve Teknik Servis listelerinde tekrar ettiği için çıkarıldı)
- `src/shared/widgets/PrimaryButton.tsx` — genişletildi: `variant` prop'una `'success' | 'danger'` eklendi, `size?: 'md' | 'lg'` eklendi (mevcut tüm kullanım yerleri varsayılan `variant='primary', size='md'` ile değişmeden çalışmaya devam ediyor — geriye dönük uyumlu)
- `package.json` / `package-lock.json` — `expo-linear-gradient` eklendi (SDK 57 uyumlu `~57.0.1`)

## Bağımlılık kurulumu notu

`npx expo install expo-linear-gradient` peer-dependency çakışması yüzünden başarısız oldu (expo-router'ın web hedefi için getirdiği `@expo/ui`/`vaul`/`@radix-ui` zincirinin `react-dom` peer'ı projede yok). `npm install expo-linear-gradient --legacy-peer-deps` ile kuruldu. Lockfile diff'i kontrol edildi: sadece `expo-linear-gradient` eklendi; kaldırılan tek şeyler kaynak kodda hiç import edilmeyen, kullanılmayan "peer:true" fantom paketleriydi (`react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`, `react-dom`, birkaç babel dönüşüm eklentisi) — bunlar zaten node_modules'te gerçek dosya içeriğiyle kurulu değildi, sadece npm'in peer-dep çözümü sırasında lockfile'a yazdığı girdilerdi. Metro derlemesi ve simülatör testi bu paketler olmadan sorunsuz çalıştı. Hiçbir direkt bağımlılığın (axios, zustand, tanstack-query, expo-router, expo-secure-store, expo-image-picker vb.) versiyonu değişmedi.

`npx expo install --check` bazı paketlerin (expo, expo-constants, expo-font, expo-router, react-native vb.) SDK 57 için "en güncel" patch'in biraz gerisinde olduğunu gösteriyor — bu drift benim değişikliğimden önce de vardı (expo-linear-gradient dışında hiçbir versiyon değişmedi), kapsam dışı olduğu için dokunulmadı.

## Kategori eşleme kararı (RN form'u olan/olmayan)

Web'in 21 kalemlik "Bize Sat" listesiyle RN'nin 15 kalemlik `categoryFormConfigs.ts`'i karşılaştırıldı. Formu OLAN 13 kalem gerçek `/sell/<id>` route'una linkleniyor:

Dizüstü (Notebook)→notebook, Monitör→monitor, Ekran Kartı→graphics-card, İşlemci→processor, RAM→ram, SSD→ssd, Soğutucu→cooler, Boş Kasa→case, Klavye→keyboard, Mouse→mouse, Tablet→tablet, Kulaklık→headphones, Ses Sistemi→audio-system.

Formu OLMAYAN 8 kalem (**yeni form YAZILMADI, kapsam dışı**) — listede görünüyor, sağında "Yakında" etiketi var, dokununca `Alert.alert('Yakında', ...)` gösteriyor, hiçbir route'a gitmiyor / crash olmuyor:

Cep Telefonu, Masaüstü (Kasa) — dikkat: bu web'de "Boş Kasa"dan ayrı, tam masaüstü PC anlamında; RN'nin tek "case" konfigürasyonu boş kasa/PSU alanlarına sahip olduğu için "Boş Kasa"ya eşlendi, "Masaüstü (Kasa)" formsuz kaldı —, PlayStation, Gamepad, Xbox, Fotokopi Makinesi, Yazıcı, Tarayıcı.

RN'nin config'inde olup web'in anasayfa listesinde YER ALMAYAN 2 kategori (`sound-system`/Hoparlör, `gaming-wheel`/Direksiyon Seti) bilerek anasayfaya eklenmedi — web ile birebir eşleşme hedeflendiği için.

## Teknik Servis

RN tarafında Teknik Servis'e ait hiçbir ekran/route yok (**yeni ekran/route YAZILMADI, kapsam dışı**). "TEKNİK SERVİS" butonu ve 9 kalemlik kategori listesi sadece görsel; hepsi dokununca `Alert.alert('Yakında', 'Teknik Servis randevu ekranı yakında eklenecek.')` gösteriyor.

## Tasarım/renk kararları (token yokluğunda en yakın seçim)

- Amber banner: `theme.colors.warning` (#F59E0B) web'in #f59e0b'siyle birebir aynı; gradient için `expo-linear-gradient` ile `[warning, background]` (iki mevcut token) kullanıldı — projede ikinci bir amber tonu tanımlı olmadığı için tam CSS gradient'i (3 duraklı) birebir kopyalanmadı.
- Kırmızı ok aksanı ve SATILIK İLANLAR butonu: `theme.colors.danger` (#DC2626) web'in #dc2626'sıyla birebir aynı.
- BİZE SAT butonu: web #22c55e — projede yeşil tonlardan (`success` #059669, `successLight` #10B981) `successLight` renk mesafesi olarak daha yakın, o kullanıldı.
- TEKNİK SERVİS bölümü (web'de mor #8b5cf6/#6b21a8): **projede hiç mor/violet tonu yok**. En yakın anlamlı token olarak `theme.colors.primary` (mavi) kullanıldı. Bu bir renk yaklaşıklaması — birebir web hissi değil, kullanıcı isterse `colors.ts`'e gerçek bir mor "accent" token'ı eklenmesi ayrı bir karar olarak değerlendirilebilir (bu görevde eklenmedi, kapsam dışı tutuldu).
- Kart gölgeleri: projede önceden hiç `shadowColor/elevation` kullanımı yoktu; `theme.colors.textPrimary` shadowColor olarak seçildi (siyah yerine token'dan türetilen koyu lacivert).

## Kritik, kapsam dışı bulgu (kullanıcıya bildiriliyor, koda DOKUNULMADI)

Eski `HomeScreen`, aynı zamanda uygulamanın **tek navigasyon merkeziydi**: profil kartında kullanıcı adı/e-postası + "Çıkış yap" ve grid'de Tekliflerim/Profil linkleri vardı. `app/(app)/_layout.tsx`'te tab bar veya header yok (sadece `<Stack screenOptions={{ headerShown: false }} />`). Web tarafında bu linkler `app/page.tsx` içinde değil, ayrı bir `app/components/Header.tsx` (global layout) içinde yaşıyor.

Web'in gerçek görünümüne birebir uyum için bu görevin talimatı gereği o profil kartı/menü kaldırıldı (web'in ana sayfa içeriğinde kullanıcıya özel bir bölüm yok). **Sonuç: yeni HomeScreen'de artık Tekliflerim, Profil ve Çıkış Yap ekranlarına ulaşmanın hiçbir yolu kalmadı** — bu ekranların kendisi bozulmadı, sadece oraya gidecek bir giriş noktası kalmadı. Bu, görev kapsamının (sadece HomeScreen.tsx) dışında bir navigasyon-mimarisi kararı gerektiriyor (örn. `app/(app)/_layout.tsx`'e bottom tab bar eklemek, ya da anasayfaya küçük bir profil/çıkış ikonu eklemek — web'deki Header.tsx'in RN karşılığı). Kod değiştirilmedi, kullanıcının karar vermesi için burada raporlanıyor.

## Tip/lint durumu

- `npx tsc --noEmit` → temiz.
- `npx expo lint` → temiz (bir `no-unused-vars` uyarısı çıktı, giderildi).

## Simülatör testi

Metro `--port 8090 --ios` ile başlatıldı, booted "iPhone 17 Pro Max" simülatöründe Expo Go üzerinden gerçek build alındı (JS bundle 100%'e kadar izlendi). Ekran görüntüsü doğrulandı:

- Amber "2. El Ürününü" banner + kırmızı ok, yeşil "BİZE SAT" butonu, "Kategoriler" başlığı, ikonlu kategori satırları (Cep Telefonu / Masaüstü (Kasa) üzerinde "Yakında" etiketi görünüyor, Dizüstü/Monitör/Ekran Kartı/İşlemci/RAM/SSD/Soğutucu/Boş Kasa linkli) — beklenen gibi render oldu.

Sayfanın geri kalanı (Teknik Servis kartı, Satılık İlanlar butonu + slider) simülatörde otomatik scroll/swipe scriptleyecek bir dokunma aracı (idb/cliclick yok, JXA ile CGEvent denendi ama Simulator penceresi koordinat sistemiyle uyumlu çalıştırılamadı) bulunmadığı için görsel olarak ayrıca doğrulanamadı; bu bölümler üstteki, doğrulanmış bölümle birebir aynı bileşen/desenleri (`SectionBanner`, `CategoryListItem`, `PrimaryButton`) kullandığı için kod incelemesiyle güvenilir kabul edildi. `ListingSlider` içindeki TanStack Query çağrısı gerçek `/api/listings` uç noktasını (`listingsRepository.fetchListings`) kullanıyor; local dev backend'inde ilan olup olmadığı test edilmedi (boş durum ve yükleniyor durumu için ayrı render dalları kodda mevcut).

## Test verisi

Bu görevde herhangi bir test hesabı/kayıt oluşturulmadı; temizlik gerekmiyor.
