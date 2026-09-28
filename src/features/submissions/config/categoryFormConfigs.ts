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
  extraFields: FieldConfig[];
}

const COSMETIC_CONDITIONS = ['Sıfır Gibi', 'Az Kullanılmış', 'İyi', 'Yıpranmış'];

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
      { key: 'powerSupply', label: 'Güç Kaynağı Dahil mi', type: 'text' },
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
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'refreshRate', label: 'Yenileme Hızı', type: 'text' },
      { key: 'panelType', label: 'Panel Tipi', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED'] },
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
      { key: 'layout', label: 'Düzen', type: 'select', options: ['TR-Q', 'TR-F', 'US'] },
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] },
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
      { key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] },
    ],
  },
  {
    id: 'headphones',
    name: 'Kulaklık',
    icon: '🎧',
    endpoint: '/api/headphones-submissions',
    responseShape: 'standard',
    extraFields: [{ key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz', 'Bluetooth'] }],
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
      { key: 'ramType', label: 'Tip', type: 'select', options: ['DDR3', 'DDR4', 'DDR5'] },
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
      { key: 'interface', label: 'Arayüz', type: 'select', options: ['SATA', 'NVMe'] },
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
      { key: 'storage', label: 'Depolama', type: 'text' },
      { key: 'batteryHealth', label: 'Batarya Sağlığı', type: 'text' },
    ],
  },
  {
    id: 'cooler',
    name: 'Soğutucu',
    icon: '❄️',
    endpoint: '/api/cooler-submissions',
    responseShape: 'standard',
    extraFields: [{ key: 'type', label: 'Tip', type: 'select', options: ['Hava', 'Sıvı'] }],
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
    ],
  },
  {
    id: 'gaming-wheel',
    name: 'Direksiyon Seti',
    icon: '🏎️',
    endpoint: '/api/gaming-wheel-submissions',
    responseShape: 'standard',
    extraFields: [{ key: 'connectivity', label: 'Bağlantı', type: 'select', options: ['Kablolu', 'Kablosuz'] }],
  },
  // Aşağıdaki 8 kategoride web'de dedicated bir `/api/xxx-submissions` route'u
  // yok, hepsi genel `/api/submissions` uç noktasına (handleProductSubmission)
  // gönderiyor. Bazı alanlar (color, controllers, games, connectionType,
  // printSpeed, copySpeed, scanSpeed) backend'in ALLOWED_FIELDS whitelist'inde
  // (lib/handleProductSubmission.ts) yok — sessizce kaydedilmiyor. (registrationType
  // web'de artık whitelist'te ve şemada.) Web ile görsel tutarlılık için yine de
  // formda gösteriyoruz.
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
      { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], required: true },
      { key: 'batteryHealth', label: 'Batarya Sağlığı (%)', type: 'text', keyboardType: 'numeric' },
      { key: 'screenSize', label: 'Ekran Boyutu (inç)', type: 'text' },
      { key: 'color', label: 'Renk', type: 'text' },
      { key: 'registrationType', label: 'Kayıt Türü', type: 'select', options: ['Yurtiçi', 'Yurtdışı'], required: true },
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
      { key: 'storageType', label: 'Depolama Tipi', type: 'select', options: ['SSD', 'NVMe', 'HDD', 'SSD + HDD'] },
      { key: 'powerSupply', label: 'Güç Kaynağı', type: 'text' },
      { key: 'motherboard', label: 'Anakart', type: 'text' },
      { key: 'case', label: 'Kasa', type: 'text' },
    ],
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    icon: '🎮',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'model', label: 'PlayStation Modeli', type: 'select', options: ['PS5', 'PS5 Digital', 'PS4 Pro', 'PS4', 'PS4 Slim'], required: true },
      { key: 'storage', label: 'Depolama', type: 'select', options: ['500GB', '825GB', '1TB', '2TB'] },
      { key: 'color', label: 'Renk', type: 'text' },
      { key: 'controllers', label: 'Kol Sayısı', type: 'text', keyboardType: 'numeric' },
      { key: 'games', label: 'Oyunlar', type: 'text' },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
    ],
  },
  {
    id: 'gamepad',
    name: 'Gamepad',
    icon: '🕹️',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'condition', label: 'Durum', type: 'text' },
      { key: 'color', label: 'Renk', type: 'text' },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
    ],
  },
  {
    id: 'xbox',
    name: 'Xbox',
    icon: '🎮',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      { key: 'model', label: 'Xbox Modeli', type: 'select', options: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One'], required: true },
      { key: 'storage', label: 'Depolama', type: 'select', options: ['512GB', '1TB', '2TB'] },
      { key: 'color', label: 'Renk', type: 'text' },
      { key: 'controllers', label: 'Kol Sayısı', type: 'text', keyboardType: 'numeric' },
      { key: 'games', label: 'Oyunlar', type: 'text' },
      { key: 'accessories', label: 'Aksesuarlar', type: 'text' },
    ],
  },
  {
    id: 'fotokopi-makinesi',
    name: 'Fotokopi Makinesi',
    icon: '📄',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      {
        key: 'type',
        label: 'Makine Tipi',
        type: 'select',
        required: true,
        options: ['Mono (Siyah-Beyaz)', 'Renkli', 'Multifonksiyon', 'A3 Boyut', 'A4 Boyut', 'Büro Tipi', 'Endüstriyel', 'Taşınabilir'],
      },
      { key: 'connectionType', label: 'Bağlantı Türü', type: 'select', options: ['USB', 'WiFi', 'Ethernet', 'USB + WiFi', 'USB + Ethernet', 'WiFi + Ethernet'] },
      { key: 'copySpeed', label: 'Kopya Hızı', type: 'text' },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'color', label: 'Renk', type: 'text' },
    ],
  },
  {
    id: 'yazici',
    name: 'Yazıcı',
    icon: '🖨️',
    endpoint: '/api/submissions',
    responseShape: 'standard',
    extraFields: [
      {
        key: 'type',
        label: 'Yazıcı Tipi',
        type: 'select',
        required: true,
        options: ['Laser Yazıcı', 'Mürekkep Püskürtmeli', 'Lazer Yazıcı', 'Multifonksiyon', 'A3 Yazıcı', 'A4 Yazıcı', 'Taşınabilir', 'Büro Tipi'],
      },
      { key: 'color', label: 'Renk', type: 'select', options: ['Siyah-Beyaz', 'Renkli', 'Siyah-Beyaz + Renkli'] },
      { key: 'connectionType', label: 'Bağlantı Türü', type: 'select', options: ['USB', 'WiFi', 'Ethernet', 'USB + WiFi', 'USB + Ethernet', 'WiFi + Ethernet', 'Bluetooth'] },
      { key: 'printSpeed', label: 'Yazdırma Hızı', type: 'text' },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
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
        options: ['Flatbed (Düz Yatak)', 'Sheet-fed (Sayfa Beslemeli)', 'Handheld (El Tipi)', 'Drum (Tambur)', 'Film', 'Slide', 'Document', 'Diğer'],
      },
      { key: 'connectionType', label: 'Bağlantı Türü', type: 'select', options: ['USB', 'USB 2.0', 'USB 3.0', 'USB-C', 'WiFi', 'Ethernet', 'Firewire', 'SCSI', 'Diğer'] },
      { key: 'resolution', label: 'Çözünürlük', type: 'text' },
      { key: 'scanSpeed', label: 'Tarama Hızı', type: 'text' },
    ],
  },
];

export function getCategoryFormConfig(id: string): CategoryFormConfig | undefined {
  return CATEGORY_FORM_CONFIGS.find((c) => c.id === id);
}

export const COSMETIC_CONDITION_OPTIONS = COSMETIC_CONDITIONS;
