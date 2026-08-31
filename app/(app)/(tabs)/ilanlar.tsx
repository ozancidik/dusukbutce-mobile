import { ListingsScreen } from '../../../src/features/listings/screens/ListingsScreen';

// "İlanlar" tab'ı: pre-login `app/listings/index.tsx` ile aynı ListingsScreen
// component'ini yeniden kullanır. Dosya adı bilinçli olarak "listings" değil
// "ilanlar" — çünkü (app)/(tabs) grubu path segmentlerini gizlese de "listings"
// adını kullanırsak kök `app/listings/index.tsx` (giriş yapmadan erişilebilen,
// hiçbir Stack.Protected ile korunmayan route) ile birebir aynı "/listings"
// path'ine çarpışırdı. Bkz. .claude/reports/2026-08-31-tab-navigasyon.md
export default function IlanlarTab() {
  return <ListingsScreen />;
}
