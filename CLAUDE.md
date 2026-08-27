@AGENTS.md

# Proje kuralları

dusukbutce-mobile, dusukbutce.com'un (Next.js/MongoDB, repo: `~/Desktop/dusukbutce-web`) React Native/Expo mobil istemcisidir. Backend'e asla bu repodan yazma yapılmaz — sadece tüketilir. Yeni bir API entegrasyonu yazmadan önce ilgili `~/Desktop/dusukbutce-web/app/api/.../route.ts` dosyası okunup gerçek request/response şekli doğrulanır, tahmin edilmez.

Mimari kısa özet (ayrıntı için `.claude/agents/mobil-frontend.md`): `expo-router` dosya-tabanlı navigasyon, Zustand (auth) + TanStack Query (sunucu verisi), tek bir `apiClient` (`src/core/network/apiClient.ts`), tema `src/core/theme/`. Her feature `src/features/<isim>/{api,screens,components}` düzeninde.

## Gözetimsiz (kullanıcı PC başında değilken) çalışma kuralları

Bu proje zaman zaman kullanıcı PC başında değilken çalıştırılıyor. Hangi agent/oturum olursa olsun şu kurallar geçerli:

- **`main`'e asla doğrudan commit/push yapma.** Her göreve kendi feature branch'inde başla (`git checkout -b <kısa-açıklayıcı-isim>`), orada commit'le. Kullanıcı dönünce gözden geçirip kendisi merge eder.
- **Kapsam disiplini.** Verilen görevle sınırlı kal. Görev dışı bir sorun/iyileştirme fark edersen kod değiştirmeden rapora not düş — "bu arada şunu da hallettim" yapma, kullanıcı dönünce neyin neden değiştiğini takip edemez hale gelir.
- **Her görev sonunda rapor bırak.** `.claude/reports/<tarih>-<konu>.md` — ne yapıldı, hangi dosyalar değişti, tip/lint durumu, test edilebildiyse sonucu, test edilemediyse neden.
- **Dur koşulları.** Aynı hatada/aynı build sorununda 3 denemeden fazla üst üste takılırsan durup rapora net şekilde ne olduğunu yaz; aynı şeyi tekrar tekrar deneyerek token/zaman tüketme.
- **Test verisi temizliği.** Local dev ortamı prod veritabanını kullanır (aynı MongoDB). Test için oluşturulan her hesap/kayıt (`qa-*@example.com` deseninde) iş bitince mutlaka silinir.

