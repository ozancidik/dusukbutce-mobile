export interface ListingCategory {
  id: string;
  name: string;
  icon: string;
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  { id: 'all', name: 'Tümü', icon: '🏠' },
  { id: 'notebook', name: 'Dizüstü', icon: '💻' },
  { id: 'desktop', name: 'Masaüstü', icon: '🖥️' },
  { id: 'graphics-card', name: 'Ekran Kartı', icon: '🎮' },
  { id: 'processor', name: 'İşlemci', icon: '⚙️' },
  { id: 'monitor', name: 'Monitör', icon: '🖥️' },
  { id: 'keyboard', name: 'Klavye', icon: '⌨️' },
  { id: 'mouse', name: 'Fare', icon: '🖱️' },
  { id: 'headphones', name: 'Kulaklık', icon: '🎧' },
  { id: 'ram', name: 'RAM', icon: '💾' },
  { id: 'ssd', name: 'SSD', icon: '💿' },
  { id: 'tablet', name: 'Tablet', icon: '📱' },
];

export function getCategoryLabel(categoryId?: string): string {
  if (!categoryId) return '-';
  return LISTING_CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId;
}
