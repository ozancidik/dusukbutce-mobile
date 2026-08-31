import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { CategoryListItem } from '../../../shared/widgets/CategoryListItem';
import { TEKNIK_SERVIS_CATEGORIES, HomeCategoryItem } from '../../home/data/homeCategories';
import { DeliveryMethodSheet } from '../components/DeliveryMethodSheet';
import { DeliveryMethod } from '../api/technicalServiceRepository';

// dusukbutce.com/teknik-servis landing sayfasının (app/teknik-servis/page.tsx)
// mobil karşılığı: 9 servis kartı, her birine dokununca teslimat yöntemi
// (Evimden Al / Kargo ile Gönder) seçtirilip forma geçiliyor.
export function TechnicalServiceLandingScreen() {
  const [selectedService, setSelectedService] = useState<HomeCategoryItem | null>(null);

  const handleSelectMethod = (method: DeliveryMethod) => {
    const service = selectedService;
    setSelectedService(null);
    if (!service) return;
    router.push({
      pathname: '/teknik-servis/form',
      params: { serviceType: service.name, deliveryMethod: method },
    });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'} Geri</Text>
      </Pressable>

      <Text style={styles.title}>Teknik Servis</Text>
      <Text style={styles.subtitle}>Bir hizmet seçin, teslimat yöntemini belirleyip talebinizi oluşturun</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {TEKNIK_SERVIS_CATEGORIES.map((item) => (
          <CategoryListItem
            key={item.name}
            icon={item.icon}
            name={item.name}
            onPress={() => setSelectedService(item)}
          />
        ))}
      </ScrollView>

      <DeliveryMethodSheet
        visible={selectedService !== null}
        service={selectedService}
        onSelect={handleSelectMethod}
        onCancel={() => setSelectedService(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  backButton: { paddingTop: 60, paddingHorizontal: theme.spacing.lg },
  backText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium, fontSize: 15 },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.sm },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.lg,
    marginTop: 4,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
  },
  list: { padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.sm, paddingBottom: theme.spacing.xl },
});
