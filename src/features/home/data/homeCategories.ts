// dusukbutce.com anasayfasının mobil görünümündeki (isMobile dalı, app/page.tsx
// satır 373-396) "Bize Sat" kategori listesiyle birebir aynı sıra ve isimler.
// `formId` dolu olan kalemler src/features/submissions/config/categoryFormConfigs.ts
// içinde gerçek bir forma karşılık gelir (/sell/<formId>). formId'siz kalemler
// web'de var ama RN'de henüz forma sahip değil — bkz. görev raporu.
export interface HomeCategoryItem {
  name: string;
  icon: string;
  formId?: string;
}

export const BIZE_SAT_HOME_CATEGORIES: HomeCategoryItem[] = [
  { name: 'Cep Telefonu', icon: '📱' },
  { name: 'Dizüstü (Notebook)', icon: '💻', formId: 'notebook' },
  { name: 'Masaüstü (Kasa)', icon: '🖥️' },
  { name: 'Monitör', icon: '🖥️', formId: 'monitor' },
  { name: 'Ekran Kartı', icon: '🎮', formId: 'graphics-card' },
  { name: 'İşlemci', icon: '⚙️', formId: 'processor' },
  { name: 'RAM', icon: '💾', formId: 'ram' },
  { name: 'SSD', icon: '💿', formId: 'ssd' },
  { name: 'Soğutucu', icon: '❄️', formId: 'cooler' },
  { name: 'Boş Kasa', icon: '📦', formId: 'case' },
  { name: 'PlayStation', icon: '🎮' },
  { name: 'Gamepad', icon: '🕹️' },
  { name: 'Xbox', icon: '🎮' },
  { name: 'Klavye', icon: '⌨️', formId: 'keyboard' },
  { name: 'Mouse', icon: '🖱️', formId: 'mouse' },
  { name: 'Tablet', icon: '📱', formId: 'tablet' },
  { name: 'Kulaklık', icon: '🎧', formId: 'headphones' },
  { name: 'Ses Sistemi', icon: '🔊', formId: 'audio-system' },
  { name: 'Fotokopi Makinesi', icon: '📄' },
  { name: 'Yazıcı', icon: '🖨️' },
  { name: 'Tarayıcı', icon: '🔍' },
];

// dusukbutce.com anasayfasındaki Teknik Servis kategori listesi (satır 721-730).
// RN tarafında Teknik Servis'e ait bir ekran/route yok; bu liste yalnızca
// görsel amaçlı, dokununca hiçbir yere yönlendirmiyor.
export const TEKNIK_SERVIS_CATEGORIES: HomeCategoryItem[] = [
  { name: 'PC Onarım', icon: '🖥️' },
  { name: 'Laptop Tamiri', icon: '💻' },
  { name: 'Monitör Tamiri', icon: '🖥️' },
  { name: 'Format Atma', icon: '💾' },
  { name: 'Parça Montajı', icon: '🔧' },
  { name: 'Telefon Onarım', icon: '📱' },
  { name: 'Tablet Tamiri', icon: '📱' },
  { name: 'PC Toplama', icon: '⚙️' },
  { name: 'Veri Kurtarma', icon: '💿' },
];
