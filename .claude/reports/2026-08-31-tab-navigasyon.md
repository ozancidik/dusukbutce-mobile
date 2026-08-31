# Tab Navigasyon — Alt Tab Bar Eklendi

Tarih: 2026-08-31

## Bağlam ve branch notu (önemli)

Görev `anasayfa-web-tasarim` branch'inin üzerine devam etmemi istiyordu, ancak bu ajan
kendi git worktree'sinde izole çalışıyor ve `anasayfa-web-tasarim` branch'i o sırada
başka bir worktree'de (`/Users/ozan.cidik/Desktop/dusukbutce-mobile/.claude/worktrees/agent-a1a7b374e2e1dabf0`)
zaten checkout edilmiş durumdaydı — git aynı branch'in iki worktree'de aynı anda
checkout edilmesine izin vermiyor (`fatal: 'anasayfa-web-tasarim' is already used by
worktree at ...`), ve bu ajan sandbox kuralı gereği o diğer worktree dizinine
`cd`/`git -C` ile de erişemiyor.

Bu yüzden **`anasayfa-web-tasarim` yerine `anasayfa-web-tasarim-tabs` adında yeni bir
branch açtım**, ama bunu `anasayfa-web-tasarim`'in ucu olan commit'ten (`383a0cf
Anasayfayı dusukbutce.com'un gerçek mobil görünümüyle eşleştir`) türettim, yani içerik
olarak tam olarak "o branch'in üzerine devam" ettim — sadece branch adı farklı.
Kullanıcı PC başına döndüğünde iki worktree'den biri kapatılıp `anasayfa-web-tasarim-tabs`
branch'i `anasayfa-web-tasarim`'e fast-forward/merge edilmeli (veya diğer worktree
serbest bırakılıp bu commit o branch'e taşınmalı). main'e hiçbir noktada dokunulmadı.

## Ne yapıldı

`app/(app)/_layout.tsx`'teki düz `Stack`'i değiştirmeden, altına 4 sekmeli bir
`(tabs)` route grubu eklendi (expo-router v57 `Tabs`/`Tabs.Screen` API'si — v57
sürüm dokümantasyonunda (`/versions/v57.0.0/sdk/router`) `Tabs`/`Tabs.Screen`
bileşenlerinin hâlâ mevcut ve "renders a tabs navigator" olarak tanımlandığı
doğrulandı).

- **Yeni**: `app/(app)/(tabs)/_layout.tsx` — `Tabs` navigator, 4 sekme: Anasayfa (🏠),
  İlanlar (🏷️), Teklifler (📋), Profil (👤). `tabBarActiveTintColor: theme.colors.primary`,
  `tabBarInactiveTintColor: theme.colors.textMuted`, `headerShown: false`.
- **Taşındı**: `app/(app)/index.tsx` → `app/(app)/(tabs)/index.tsx` (HomeScreen,
  import path 2 seviyeden 3 seviyeye güncellendi).
- **Taşındı**: `app/(app)/offers/index.tsx` → `app/(app)/(tabs)/offers.tsx` (OffersScreen,
  import path değişmedi — aynı derinlik).
- **Taşındı**: `app/(app)/profile/index.tsx` → `app/(app)/(tabs)/profile.tsx` (ProfileScreen,
  import path değişmedi). `app/(app)/profile/` klasörü artık yalnızca `addresses.tsx`
  içeriyor — bu dosyaya dokunulmadı, hâlâ `(tabs)` DIŞINDA, `(app)` seviyesinde bir
  stack screen, yani Profil'den push edildiğinde tab bar'ın üstüne tam ekran açılıyor
  (davranış değişmedi).
- **Yeni**: `app/(app)/(tabs)/ilanlar.tsx` — "İlanlar" sekmesi, mevcut
  `ListingsScreen` component'ini (`src/features/listings/screens/ListingsScreen.tsx`)
  olduğu gibi import edip render ediyor, component taşınmadı/kopyalanmadı.
  **Bilinçli sapma**: dosya adı görevde önerilen "listings.tsx" değil "ilanlar.tsx" —
  çünkü `(app)` ve `(tabs)` birer route grubu olduğundan (parantezli klasörler path'e
  segment eklemiyor) `app/(app)/(tabs)/listings.tsx` de tıpkı kök seviyedeki
  `app/listings/index.tsx` gibi `/listings` path'ine çözülürdü. Kök `app/listings/index.tsx`
  hiçbir `Stack.Protected` ile korunmuyor (giriş yapılmadan da erişilebilmesi gerekiyor,
  `app/_layout.tsx`'te ayrı bir `Stack.Screen name="listings"` olarak tanımlı) — yani
  bu iki route, mutually-exclusive bir auth-guard bloğunun içinde DEĞİL, aynı anda route
  tablosunda bulunacaklardı; bu da gerçek bir path çakışmasına yol açardı (auth
  guard'ların "aynı isim farklı korumalı gruplarda güvenli" deseninden farklı bir durum).
  Bu yüzden sekmenin dosya adını "ilanlar" yaptım, path "/ilanlar" oldu; sekme başlığı
  yine "İlanlar" ve component birebir aynı `ListingsScreen`. HomeScreen'deki "SATILIK
  İLANLAR" butonu hâlâ `router.push('/listings')` çağırıyor ve kök (pre-login) route'a
  gidiyor — buna dokunulmadı.
- **Eklendi**: `src/features/profile/screens/ProfileScreen.tsx`'e "Çıkış Yap" butonu.
  `useAuthStore((s) => s.logout)` kullanılıyor (component içinde hook olarak, store'un
  dışından `getState()` ile değil — projenin geri kalanıyla tutarlı). `Alert.alert` ile
  onay diyaloğu var (`AddressesScreen.tsx`'teki `confirmDelete` pattern'iyle aynı stil:
  "Vazgeç" / destructive aksiyon butonu).

## Dokunulmayan / kapsam dışı bırakılanlar

- `HomeScreen.tsx` içeriği (banner/kategori/slider) — talep edildiği gibi hiç
  değiştirilmedi.
- `app/(app)/sell/index.tsx`, `app/(app)/sell/[category].tsx` — değişmedi, hâlâ
  `(tabs)` dışında `(app)` seviyesinde, HomeScreen'den stack push ile açılıyor.
- `app/listings/index.tsx`, `app/listings/[id].tsx`, `app/_layout.tsx` — hiç
  dokunulmadı; pre-login "Giriş yapmadan ilanlara göz at" akışı bozulmadı.
- `package-lock.json` — bu worktree'de `node_modules` hiç kurulu değildi (`npm install`
  çalıştırmak zorunda kaldım, TSC/lint için gerekliydi); bu install lockfile'da
  ilgisiz/otomatik farklar oluşturdu, bunları `git checkout -- package-lock.json` ile
  geri aldım, commit'e dahil etmedim (görev dışı gürültü).

## Doğrulama

- `npx tsc --noEmit` → temiz (0 hata).
- `npx expo lint` → temiz (exit 0).
- `npx expo start --port 8090` ile Metro başlatıldı; `index.bundle?platform=ios&dev=true`
  endpoint'i `curl` ile çekildi, 200 döndü, ~7.7MB bundle sorunsuz üretildi, Metro
  loglarında hiçbir "duplicate/conflict/warn/error" satırı yok (bkz. route çakışması
  endişesi yukarıda — pratikte de doğrulanmış oldu, gerçi bu projede typed routes
  (`experiments.typedRoutes`) etkin değil, o yüzden statik bir "duplicate route" derleme
  hatası zaten oluşmazdı; riski dosya adını değiştirerek en baştan ortadan kaldırdım).
- **Simülatör/cihaz ile görsel doğrulama yapılamadı** (bu ortamda bağlı bir simülatör/
  cihaz yok) — yani 4 sekme arası geçiş, Profil→Adreslerim push'un tab bar'ı gizlediği,
  Bize Sat akışının çalıştığı ve pre-login "Giriş yapmadan ilanlara göz at" akışının
  bozulmadığı yalnızca kod okuma + route yapısı analizi + başarılı Metro bundle ile
  doğrulandı, gerçek bir ekranda gözle görülerek doğrulanmadı.

## Değişen/yeni dosyalar

- Yeni: `app/(app)/(tabs)/_layout.tsx`
- Yeni: `app/(app)/(tabs)/ilanlar.tsx`
- Taşındı: `app/(app)/index.tsx` → `app/(app)/(tabs)/index.tsx` (import path güncellendi)
- Taşındı: `app/(app)/offers/index.tsx` → `app/(app)/(tabs)/offers.tsx`
- Taşındı: `app/(app)/profile/index.tsx` → `app/(app)/(tabs)/profile.tsx`
- Değiştirildi: `src/features/profile/screens/ProfileScreen.tsx` (Çıkış Yap butonu + stilleri)
- Dokunulmadı: `app/(app)/_layout.tsx` (zaten boş `<Stack screenOptions={{ headerShown: false }} />`,
  nested `(tabs)` grubunu otomatik keşfediyor, `sell/` ve `profile/addresses.tsx`
  onunla aynı seviyede sibling screen olarak kalıyor)

## Branch / merge notu (tekrar)

Commit `anasayfa-web-tasarim-tabs` branch'inde (main'e değil). Kullanıcı PC başına
döndüğünde: (1) diğer worktree'yi (`agent-a1a7b374e2e1dabf0`, `anasayfa-web-tasarim`
branch'i) kapatsın/serbest bıraksın, (2) bu branch'i `anasayfa-web-tasarim` üzerine
fast-forward etsin ya da doğrudan `anasayfa-web-tasarim-tabs`'ı gözden geçirip
`anasayfa-web-tasarim`'e merge etsin.
