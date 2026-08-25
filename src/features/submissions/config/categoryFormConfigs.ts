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
    id: 'sound-system',
    name: 'Hoparlör',
    icon: '📢',
    endpoint: '/api/sound-system-submissions',
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
];

export function getCategoryFormConfig(id: string): CategoryFormConfig | undefined {
  return CATEGORY_FORM_CONFIGS.find((c) => c.id === id);
}

export const COSMETIC_CONDITION_OPTIONS = COSMETIC_CONDITIONS;
