import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { CATEGORY_FORM_CONFIGS } from '../config/categoryFormConfigs';

export function CategoryPickerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bize Sat</Text>
      <Text style={styles.subtitle}>Satmak istediğiniz ürünün kategorisini seçin</Text>

      <FlatList
        data={CATEGORY_FORM_CONFIGS}
        keyExtractor={(c) => c.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable style={styles.tile} onPress={() => router.push(`/sell/${item.id}`)}>
            <Text style={styles.tileIcon}>{item.icon}</Text>
            <Text style={styles.tileLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, paddingTop: 60, paddingHorizontal: theme.spacing.lg },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.lg,
    marginTop: 4,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
  },
  grid: { paddingHorizontal: theme.spacing.sm, paddingBottom: theme.spacing.xl },
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 4,
  },
  tileIcon: { fontSize: 28 },
  tileLabel: { fontSize: 11, color: theme.colors.textPrimary, fontFamily: theme.fontFamily.medium, textAlign: 'center' },
});
