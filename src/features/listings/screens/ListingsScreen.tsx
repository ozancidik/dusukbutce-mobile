import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { listingsRepository } from '../api/listingsRepository';
import { LISTING_CATEGORIES } from '../categories';
import { ListingCard } from '../components/ListingCard';

export function ListingsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['listings'],
    queryFn: listingsRepository.fetchListings,
  });

  const filtered = useMemo(() => {
    const listings = data ?? [];
    if (selectedCategory === 'all') return listings;
    return listings.filter((l) => l.category === selectedCategory);
  }, [data, selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Satılık İlanlar</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={LISTING_CATEGORIES}
        keyExtractor={(c) => c.id}
        style={styles.categoryListWrapper}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isActive = item.id === selectedCategory;
          return (
            <Pressable
              onPress={() => setSelectedCategory(item.id)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{item.name}</Text>
            </Pressable>
          );
        }}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
      ) : isError ? (
        <View style={styles.centerMessage}>
          <Text style={styles.errorText}>İlanlar getirilemedi</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Bu kategoride henüz ilan bulunmuyor.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <ListingCard listing={item} onPress={() => router.push(`/listings/${item._id}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 60, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary },
  categoryListWrapper: { flexGrow: 0, marginBottom: theme.spacing.sm },
  categoryList: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm, alignItems: 'center' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
  categoryLabelActive: { color: theme.colors.white },
  grid: { paddingHorizontal: theme.spacing.sm, paddingBottom: theme.spacing.xl },
  loading: { marginTop: theme.spacing.xl },
  centerMessage: { alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.xl, gap: theme.spacing.sm },
  errorText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium },
  retryText: { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
});
