import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../core/theme/theme';
import { PrimaryButton } from '../../shared/widgets/PrimaryButton';
import { SectionBanner } from '../../shared/widgets/SectionBanner';
import { CategoryListItem } from '../../shared/widgets/CategoryListItem';
import { BIZE_SAT_HOME_CATEGORIES, TEKNIK_SERVIS_CATEGORIES } from './data/homeCategories';
import { ListingSlider } from './components/ListingSlider';

// dusukbutce.com anasayfasının (app/page.tsx) mobil görünümüyle (isMobile
// dalı, ≤1024px) görsel olarak eşleşen giriş-sonrası anasayfa. Sıralama
// web'deki flexDirection:column render sırasıyla birebir aynı:
// 1) 2. El Ürününü banner  2) BİZE SAT  3) Bize Sat kategorileri
// 4) Uzman Ekibinden Destek Al banner  5) TEKNİK SERVİS  6) Servis kategorileri
// 7) SATILIK İLANLAR  8) Gerçek ilanlar slider'ı
export function HomeScreen() {
  const showComingSoon = (name: string) => {
    Alert.alert('Yakında', `${name} için satış formu yakında eklenecek.`);
  };

  const showTeknikServisComingSoon = () => {
    Alert.alert('Yakında', 'Teknik Servis randevu ekranı yakında eklenecek.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bize Sat kartı */}
      <View style={styles.card}>
        <SectionBanner title="2. El Ürününü" />
        <View style={styles.gap} />
        <PrimaryButton title="BİZE SAT" variant="success" size="lg" onPress={() => router.push('/sell')} />

        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.categoryList}>
          {BIZE_SAT_HOME_CATEGORIES.map((item) => (
            <CategoryListItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              badge={item.formId ? undefined : 'Yakında'}
              onPress={() =>
                item.formId ? router.push(`/sell/${item.formId}`) : showComingSoon(item.name)
              }
            />
          ))}
        </View>
      </View>

      {/* Teknik Servis kartı */}
      <View style={styles.card}>
        <SectionBanner
          title="Uzman Ekibimizden Destek Al"
          subtitle="🚚 İstanbul içi aynı gün teslim alalım"
        />
        <View style={styles.gap} />
        <PrimaryButton title="TEKNİK SERVİS" variant="primary" size="lg" onPress={showTeknikServisComingSoon} />

        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.categoryList}>
          {TEKNIK_SERVIS_CATEGORIES.map((item) => (
            <CategoryListItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              onPress={showTeknikServisComingSoon}
            />
          ))}
        </View>
      </View>

      {/* Satılık İlanlar kartı */}
      <View style={styles.card}>
        <PrimaryButton title="SATILIK İLANLAR" variant="danger" size="lg" onPress={() => router.push('/listings')} />
        <View style={styles.gap} />
        <ListingSlider />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, paddingTop: 60, paddingBottom: theme.spacing.xl, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  gap: { height: theme.spacing.md },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  categoryList: { gap: theme.spacing.sm },
});
