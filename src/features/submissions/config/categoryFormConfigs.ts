export type FieldType = 'text' | 'select' | 'boolean' | 'textarea';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  keyboardType?: 'default' | 'numeric';
}

export interface CategoryFormConfig {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  // 14 kategori handleProductSubmission ile aynı response şeklini paylaşıyor
  // ({message:"Success", id, submissionNumber}); notebook-submissions farklı
  // bir response döndürüyor ({success:true, id, submissionNumber}).
  responseShape: 'standard' | 'notebook';
  // Doluysa formda "Marka" sorulmaz, bu değer gönderilir (web'de PlayStation/Xbox
  // sayfaları da markayı sabit gönderiyor). Ayrıca extraFields içinde `key: 'model'`
  // olan kategorilerde ortak "Model" kutusu gösterilmez; o alan kullanılır.
  fixedBrand?: string;
  extraFields: FieldConfig[];
}

// Web'deki bize-sat formlarının ortak seçenekleriyle birebir aynı (19-21 sayfa);
// admin paneli ve teklif akışı bu değerlere göre çalışıyor.
const COSMETIC_CONDITIONS = ['Mükemmel', 'İyi', 'Orta', 'Kötü'];

export const CATEGORY_FORM_CONFIGS: CategoryFormConfig[] = [
  {
    id: 'notebook',
    name: 'Dizüstü Bilgisayar',
    icon: '💻',
    endpoint: '/api/notebook-submissions',
    responseShape: 'notebook',
    extraFields: [
      { key: 'processorBrand', label: 'İşlemci Markası', type: 'select', options: ['Intel', 'AMD', 'Apple'] },
      { key: 'processor', label: 'İşlemci Modeli', type: 'text' },
      { key: 'ram', label: 'RAM', type: 'text' },
      { key: 'storage', label: 'Depolama', type: 'text' },
      { key: 'graphicsCard', label: 'Ekran Kartı', type: 'text' },
      { key: 'screenSize', label: 'Ekran Boyutu', type: 'text' },
      { key: 'batteryHealth', label: 'Batarya Sağlığı', type: 'text' },
      { key: 'screenStatus', label: 'Ekran Durumu', type: 'select', options: ['Sorunsuz', 'Hafif çizik / leke', 'Belirgin çizik / leke', 'Kırık / çatlak'] },
      { key: 'deadPixelCount', label: 'Ölü / Sıkışmış Piksel Sayısı', type: 'text', keyboardType: 'numeric' },
      { key: 'chargerIncluded', label: 'Şarj Adaptörü Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'layout', label: 'Klavye Düzeni', type: 'select', options: ['TR-Q', 'TR-F', 'US', 'Diğer'] },
      { key: 'knownIssues', label: 'Bilinen Arıza / Sorun', type: 'text' },
    ],
  },
  {
    id: 'case',
    name: 'Kasa',
    icon: '🖥️',
    endpoint: '/api/case-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'size', label: 'Boyut', type: 'select', options: ['ATX', 'Micro-ATX', 'Mini-ITX'] },
      { key: 'powerSupply', label: 'Güç Kaynağı', type: 'select', options: ['Var', 'Yok'] },
      { key: 'wattValue', label: 'Güç Kaynağı (W)', type: 'text' },
      { key: 'sidePanelCondition', label: 'Yan Panel Durumu', type: 'select', options: ['Sağlam', 'Çizik / çatlak', 'Yan panel yok'] },
      { key: 'includedFans', label: 'Dahil Fanlar', type: 'text' },
    ],
  },
  {
    id: 'graphics-card',
    name: 'Ekran Kartı',
    icon: '🎮',
    endpoint: '/api/graphics-card-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'memory', label: 'Bellek', type: 'text' },
      { key: 'memoryType', label: 'Bellek Tipi', type: 'select', options: ['GDDR5', 'GDDR6', 'GDDR6X'] },
      { key: 'coreClock', label: 'Çekirdek Hızı', type: 'text' },
      { key: 'powerConsumption', label: 'Güç Tüketimi', type: 'text' },
      { key: 'miningUsed', label: 'Mining Kullanıldı mı', type: 'boolean' },
    ],
  },
  {
    id: 'processor',
    name: 'İşlemci',
    icon: '⚙️',
    endpoint: '/api/processor-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'socket', label: 'Soket', type: 'text' },
      { key: 'cache', label: 'Önbellek', type: 'text' },
      { key: 'stokFan', label: 'Stok Fan Var mı', type: 'boolean' },
      { key: 'pinDamage', label: 'Soket Pinlerinde Eğiklik / Hasar Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
      { key: 'overclocked', label: 'Overclock / Delid Yapıldı mı?', type: 'select', options: ['Hayır', 'Evet'] },
    ],
  },
  {
    id: 'monitor',
    name: 'Monitör',
    icon: '🖥️',
    endpoint: '/api/monitor-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'screenSize', label: 'Ekran Boyutu', type: 'text' },
      { key: 'resolution', label: 'Çözünürlük', type: 'select', options: ['1366x768 (HD)', '1920x1080 (Full HD)', '2560x1440 (2K / QHD)', '3440x1440 (Ultrawide QHD)', '3840x2160 (4K / UHD)', 'Diğer'] },
      { key: 'refreshRate', label: 'Yenileme Hızı', type: 'select', options: ['60 Hz', '75 Hz', '100 Hz', '120 Hz', '144 Hz', '165 Hz', '180 Hz', '240 Hz', '360 Hz', 'Diğer'] },
      { key: 'panelType', label: 'Panel Tipi', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED', 'Diğer'] },
      { key: 'screenStatus', label: 'Ekran Durumu', type: 'select', options: ['Sorunsuz', 'Hafif çizik / leke', 'Belirgin çizik / leke', 'Kırık / çatlak'] },
      { key: 'deadPixelCount', label: 'Ölü / Sıkışmış Piksel Sayısı', type: 'text', keyboardType: 'numeric' },
      { key: 'accessories', label: 'Stand / Kablolar Dahil mi?', type: 'select', options: ['Stand ve kablolar dahil', 'Sadece stand', 'Sadece kablolar', 'Hiçbiri'] },
    ],
  },
  {
    id: 'keyboard',
    name: 'Klavye',
    icon: '⌨️',
    endpoint: '/api/keyboard-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'switchType', label: 'Switch Tipi', type: 'text' },
      { key: 'layout', label: 'Düzen', type: 'select', options: ['TR-Q', 'TR-F', 'US', 'Diğer'] },
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] },
      { key: 'missingKeys', label: 'Eksik Tuş / Tuş Kapağı Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
    ],
  },
  {
    id: 'mouse',
    name: 'Fare',
    icon: '🖱️',
    endpoint: '/api/mouse-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'dpi', label: 'DPI', type: 'text' },
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['USB Kablolu', '2.4GHz Kablosuz', 'Bluetooth', '2.4GHz + Bluetooth'] },
      { key: 'clickIssue', label: 'Çift Tıklama / Tık Sorunu Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
    ],
  },
  {
    id: 'headphones',
    name: 'Kulaklık',
    icon: '🎧',
    endpoint: '/api/headphones-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] },
      { key: 'type', label: 'Kulaklık Tipi', type: 'select', options: ['Kulak üstü', 'Kulak içi', 'TWS (kablosuz kulak içi)'] },
      { key: 'micWorking', label: 'Mikrofon Çalışıyor mu?', type: 'select', options: ['Evet', 'Hayır', 'Mikrofonu yok'] },
      { key: 'earPadCondition', label: 'Kulak Pedi Durumu', type: 'select', options: ['İyi', 'Yıpranmış', 'Değiştirilmiş'] },
      { key: 'chargingCase', label: 'TWS: Şarj Kutusu Dahil mi?', type: 'select', options: ['Evet', 'Hayır', 'TWS değil'] },
    ],
  },
  {
    id: 'ram',
    name: 'RAM',
    icon: '💾',
    endpoint: '/api/ram-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'capacity', label: 'Kapasite', type: 'text' },
      { key: 'speed', label: 'Hız', type: 'text' },
      { key: 'ramType', label: 'RAM Tipi', type: 'select', options: ['DDR3', 'DDR4', 'DDR5'] },
      { key: 'moduleKit', label: 'Kit / Modül Sayısı (örn: 2x8GB)', type: 'text' },
    ],
  },
  {
    id: 'ssd',
    name: 'SSD',
    icon: '💿',
    endpoint: '/api/ssd-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'capacity', label: 'Kapasite', type: 'text' },
      { key: 'type', label: 'Form Faktörü', type: 'select', options: ['M.2 NVMe', 'M.2 SATA', '2.5 inç SATA'] },
      { key: 'interface', label: 'Arayüz', type: 'text' },
      { key: 'driveHealth', label: 'Sağlık Durumu / Yazılan Veri', type: 'text' },
    ],
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: '📱',
    endpoint: '/api/tablet-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'screenSize', label: 'Ekran Boyutu', type: 'text' },
      { key: 'storage', label: 'Depolama', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
      { key: 'batteryHealth', label: 'Batarya Sağlığı', type: 'text' },
      { key: 'accountLock', label: 'Hesap Kilidi (iCloud / Google)', type: 'select', options: ['Kapalı', 'Açık'] },
      { key: 'accessories', label: 'Kalem / Klavye Dahil mi?', type: 'select', options: ['Kalem ve klavye dahil', 'Sadece kalem', 'Sadece klavye', 'Hiçbiri'] },
      { key: 'screenStatus', label: 'Ekran Durumu', type: 'select', options: ['Sorunsuz', 'Hafif çizik / leke', 'Belirgin çizik / leke', 'Kırık / çatlak'] },
      { key: 'deadPixelCount', label: 'Ölü / Sıkışmış Piksel Sayısı', type: 'text', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'cooler',
    name: 'Soğutucu',
    icon: '❄️',
    endpoint: '/api/cooler-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'type', label: 'Tip', type: 'select', options: ['Hava Soğutucu', 'Sıvı Soğutucu (AIO)'] },
      { key: 'mountingKit', label: 'Montaj Aparatları / Soket Kitleri Dahil mi?', type: 'select', options: ['Evet, tam', 'Eksik var'] },
      { key: 'pumpIssue', label: 'Sıvı Soğutucu: Pompa Sesi / Sızıntı Var mı?', type: 'select', options: ['Hayır', 'Evet', 'Hava soğutucu'] },
    ],
  },
  {
    id: 'audio-system',
    name: 'Ses Sistemi',
    icon: '🔊',
    endpoint: '/api/audio-system-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'power', label: 'Güç', type: 'text' },
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] },
      { key: 'type', label: 'Tip', type: 'select', options: ['Bluetooth Hoparlör', 'Soundbar', '2.1 Sistem', '5.1 Sistem', 'Diğer'] },
      { key: 'accessories', label: 'Kumanda / Kablolar Dahil mi?', type: 'select', options: ['Kumanda ve kablolar dahil', 'Sadece kablolar', 'Sadece kumanda', 'Hiçbiri'] },
    ],
  },
  {
    id: 'gaming-wheel',
    name: 'Direksiyon Seti',
    icon: '🏎️',
    endpoint: '/api/gaming-wheel-submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz'] },
      {
        key: 'compatibility',
        label: 'Uyumluluk',
        type: 'select',
        options: ['Bilgisayar', 'Playstation', 'Xbox', 'Bilgisayar+Playstation', 'Bilgisayar+Xbox'],
        required: true,
      },
      { key: 'pedal', label: 'Pedal Seti Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'shifterIncluded', label: 'Vites Kolu Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'forceFeedback', label: 'Force Feedback Çalışıyor mu?', type: 'select', options: ['Evet', 'Hayır', 'Desteklemiyor'] },
    ],
  },
  // Aşağıdaki 8 kategoride web'de dedicated bir `/api/xxx-submissions` route'u
  // yok, hepsi genel `/api/submissions` uç noktasına (handleProductSubmission)
  // gönderiyor. Buradaki alan anahtarları backend'in ALLOWED_FIELDS whitelist'iyle
  // (lib/handleProductSubmission.ts) BİREBİR aynı olmalı; whitelist'te olmayan
  // anahtar sessizce atılır. Yeni alan eklerken önce web'de ALLOWED_FIELDS + şema.
  //
  // Bu kategorilerin `id` değeri sunucuya `category` olarak gider ve admin
  // panelindeki kategori filtresi/etiketleri web'in kullandığı değerlerle
  // eşleşmek zorundadır (cep-telefonu, fotokopi-makinesi, yazici, tarayici).
  {
    id: 'cep-telefonu',
    name: 'Cep Telefonu',
    icon: '📱',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'storage', label: 'Depolama', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
      { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
      { key: 'batteryHealth', label: 'Batarya Sağlığı (%)', type: 'text', keyboardType: 'numeric' },
      { key: 'registrationType', label: 'Kayıt Türü', type: 'select', options: ['Yurtiçi', 'Yurtdışı'], required: true },
      { key: 'accountLock', label: 'Hesap Kilidi (iCloud / Google)', type: 'select', options: ['Kapalı', 'Açık'] },
      { key: 'partReplaced', label: 'Ekran / Parça Değişimi Yapıldı mı?', type: 'select', options: ['Hayır', 'Evet, orijinal parça', 'Evet, yan sanayi parça'] },
      { key: 'biometricWorking', label: 'Face ID / Touch ID Çalışıyor mu?', type: 'select', options: ['Evet', 'Hayır', 'Cihazda yok'] },
    ],
  },
  {
    id: 'desktop',
    name: 'Masaüstü (Kasa)',
    icon: '🖥️',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'processorBrand', label: 'İşlemci Markası', type: 'select', options: ['Intel', 'AMD'], required: true },
      { key: 'processor', label: 'İşlemci Modeli', type: 'text', required: true },
      { key: 'graphicsCard', label: 'Ekran Kartı', type: 'text', required: true },
      { key: 'graphicsCardWatt', label: 'Ekran Kartı Güç (W)', type: 'text' },
      { key: 'ram', label: 'RAM', type: 'text', required: true },
      { key: 'ramType', label: 'RAM Tipi', type: 'select', options: ['DDR3', 'DDR4', 'DDR5'] },
      { key: 'storage', label: 'Depolama', type: 'text', required: true },
      { key: 'storageType', label: 'Depolama Tipi', type: 'select', options: ['SSD(SATA)', 'SSD(NVMe)', 'HDD', 'SSD(SATA)+HDD', 'SSD(NVMe)+HDD'] },
      { key: 'powerSupply', label: 'Güç Kaynağı', type: 'text' },
      { key: 'motherboard', label: 'Anakart', type: 'text' },
      { key: 'case', label: 'Kasa', type: 'text' },
      { key: 'knownIssues', label: 'Bilinen Arıza / Sorun', type: 'text' },
    ],
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    icon: '🎮',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    fixedBrand: 'Sony',
    extraFields: [
      { key: 'model', label: 'PlayStation Modeli', type: 'select', options: ['PS5', 'PS5 Digital', 'PS4 Pro', 'PS4', 'PS4 Slim'], required: true },
      { key: 'storage', label: 'Depolama', type: 'select', options: ['500GB', '825GB', '1TB', '2TB'] },
      { key: 'controllers', label: 'Kol Sayısı', type: 'select', options: ['1', '2', '3', '4'] },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
      { key: 'stickDrift', label: 'Kolda Stick Drift Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
      { key: 'condition', label: 'Kullanım Durumu', type: 'select', options: ['Sıfır', 'Çok İyi', 'İyi', 'Orta', 'Kötü'], required: true },
      { key: 'jailbreak', label: 'Jailbreak / Modlu mu?', type: 'select', options: ['Hayır', 'Evet'] },
      { key: 'firmware', label: 'Firmware Sürümü', type: 'text' },
    ],
  },
  {
    id: 'gamepad',
    name: 'Gamepad',
    icon: '🕹️',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'condition', label: 'Kullanım Durumu', type: 'select', options: ['Sıfır', 'Çok İyi', 'İyi', 'Orta', 'Kötü'], required: true },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
      { key: 'stickDrift', label: 'Stick Drift Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
      { key: 'batteryHealth', label: 'Pil Durumu', type: 'select', options: ['İyi', 'Zayıf', 'Kablolu / pilsiz'] },
    ],
  },
  {
    id: 'xbox',
    name: 'Xbox',
    icon: '🎮',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    fixedBrand: 'Microsoft',
    extraFields: [
      { key: 'model', label: 'Xbox Modeli', type: 'select', options: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One'], required: true },
      { key: 'storage', label: 'Depolama', type: 'select', options: ['512GB', '1TB', '2TB'] },
      { key: 'controllers', label: 'Kol Sayısı', type: 'select', options: ['1', '2', '3', '4'] },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
      { key: 'stickDrift', label: 'Kolda Stick Drift Var mı?', type: 'select', options: ['Hayır', 'Evet'] },
      { key: 'condition', label: 'Kullanım Durumu', type: 'select', options: ['Sıfır', 'Çok İyi', 'İyi', 'Orta', 'Kötü'], required: true },
    ],
  },
  {
    id: 'fotokopi-makinesi',
    name: 'Fotokopi Makinesi',
    icon: '📄',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'printColor', label: 'Renk Modu', type: 'select', options: ['Mono (Siyah-Beyaz)', 'Renkli'], required: true },
      { key: 'multifunction', label: 'Çok İşlevli mi? (yazıcı + tarayıcı + fotokopi)', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'paperSize', label: 'Kağıt Boyutu', type: 'select', options: ['A4', 'A3'] },
      { key: 'usageType', label: 'Kullanım Tipi', type: 'select', options: ['Büro', 'Endüstriyel', 'Taşınabilir'] },
      { key: 'connectivity', label: 'Bağlantı Türü', type: 'select', options: ['USB', 'WiFi', 'Ethernet', 'USB + WiFi', 'USB + Ethernet', 'WiFi + Ethernet'] },
      { key: 'speed', label: 'Kopya Hızı', type: 'text' },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'pageCount', label: 'Sayfa Sayacı (Toplam Kopya)', type: 'text', keyboardType: 'numeric' },
      { key: 'tonerStatus', label: 'Toner / Drum Durumu', type: 'select', options: ['Dahil, dolu', 'Dahil, boş / az', 'Dahil değil'] },
      { key: 'adfIncluded', label: 'Otomatik Doküman Besleyici (ADF) / Kaset Dahil mi?', type: 'select', options: ['Evet', 'Hayır'] },
    ],
  },
  {
    id: 'yazici',
    name: 'Yazıcı',
    icon: '🖨️',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'type', label: 'Yazıcı Teknolojisi', type: 'select', options: ['Lazer Yazıcı', 'Mürekkep Püskürtmeli', 'Mürekkep Tanklı', 'Nokta Vuruşlu', 'Termal', 'Diğer'], required: true },
      { key: 'multifunction', label: 'Çok İşlevli mi? (yazıcı + tarayıcı + fotokopi)', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'paperSize', label: 'Kağıt Boyutu', type: 'select', options: ['A4', 'A3'] },
      { key: 'usageType', label: 'Kullanım Tipi', type: 'select', options: ['Ev / Küçük ofis', 'Büro', 'Taşınabilir'] },
      { key: 'printColor', label: 'Baskı Rengi', type: 'select', options: ['Siyah-Beyaz', 'Renkli', 'Siyah-Beyaz + Renkli'] },
      { key: 'connectivity', label: 'Bağlantı Türü', type: 'select', options: ['USB', 'WiFi', 'Ethernet', 'USB + WiFi', 'USB + Ethernet', 'WiFi + Ethernet', 'Bluetooth'] },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'pageCount', label: 'Sayfa Sayacı (Toplam Baskı)', type: 'text', keyboardType: 'numeric' },
      { key: 'tonerStatus', label: 'Toner / Kartuş Durumu', type: 'select', options: ['Dahil, dolu', 'Dahil, boş / az', 'Dahil değil'] },
    ],
  },
  {
    id: 'tarayici',
    name: 'Tarayıcı',
    icon: '🔍',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      {
        key: 'type',
        label: 'Tarayıcı Tipi',
        type: 'select',
        required: true,
        options: ['Flatbed (Düz Yatak)', 'Sheet-fed (Sayfa Beslemeli)', 'Handheld (El Tipi)', 'Drum (Tambur)', 'Film Tarayıcı', 'Slayt Tarayıcı', 'Doküman Tarayıcı', 'Diğer'],
      },
      { key: 'connectivity', label: 'Bağlantı Türü', type: 'select', options: ['USB (sürüm bilinmiyor)', 'USB 2.0', 'USB 3.0', 'USB-C', 'WiFi', 'Ethernet', 'Firewire', 'SCSI', 'Diğer'] },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'adfIncluded', label: 'Otomatik Belge Besleyici (ADF) Var mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { key: 'usageLevel', label: 'Kullanım Yoğunluğu', type: 'select', options: ['Hafif', 'Orta', 'Yoğun'] },
    ],
  },
];

export function getCategoryFormConfig(id: string): CategoryFormConfig | undefined {
  return CATEGORY_FORM_CONFIGS.find((c) => c.id === id);
}

export const COSMETIC_CONDITION_OPTIONS = COSMETIC_CONDITIONS;
