import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { listingsRepository } from '../../listings/api/listingsRepository';
import { getListingTitle } from '../../../shared/models/Listing';

const AUTO_ADVANCE_MS = 3000;
const SLIDER_HEIGHT = 200;

// dusukbutce.com anasayfasındaki gerçek ilanlar slider'ı (app/page.tsx satır
// 824-994). Web'deki manuel dragOffset/transform matematiği yerine RN'e uygun
// bir FlatList + pagingEnabled kullanılıyor; otomatik ilerleme web'deki gibi
// 3 saniyede bir, kullanıcı dokunurken duruyor.
export function ListingSlider() {
  const { data, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: listingsRepository.fetchListings,
  });

  const items = (data ?? []).slice(0, 8);

  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const isDraggingRef = useRef(false);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (!containerWidth || items.length <= 1) return;
    const timer = setInterval(() => {
      if (isDraggingRef.current) return;
      const next = (activeIndexRef.current + 1) % items.length;
      listRef.current?.scrollToOffset({ offset: next * containerWidth, animated: true });
      setActiveIndex(next);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
    // items.length değişimi ilanlar yüklendiğinde tek sefer tetiklenir
  }, [containerWidth, items.length]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!containerWidth) return;
    const nextIndex = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setActiveIndex(nextIndex);
  };

  if (isLoading) {
    return (
      <View style={[styles.centerBox, { height: SLIDER_HEIGHT }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.centerBox, { height: SLIDER_HEIGHT }]}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Henüz satılık ilan yok</Text>
        <Text style={styles.emptySubtitle}>Yeni ilan eklendiğinde burada otomatik görünecek.</Text>
      </View>
    );
  }

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 ? (
        <FlatList
          ref={listRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
          }}
          onScrollEndDrag={() => {
            isDraggingRef.current = false;
          }}
          onMomentumScrollEnd={handleMomentumEnd}
          renderItem={({ item }) => {
            const title = getListingTitle(item);
            const price = item.listing?.price;
            const imageUri = item.images?.[0];
            return (
              <Pressable
                style={[styles.slide, { width: containerWidth, height: SLIDER_HEIGHT }]}
                onPress={() => router.push(`/listings/${item._id}`)}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.slideImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.slideImagePlaceholder}>🖼️</Text>
                )}
                <Text style={styles.slideTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.slidePrice}>
                  {typeof price === 'number' ? `${price.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok'}
                </Text>
              </Pressable>
            );
          }}
        />
      ) : (
        <View style={{ height: SLIDER_HEIGHT }} />
      )}

      <View style={styles.dotsRow}>
        {items.map((item, idx) => (
          <View key={item._id} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary, fontSize: 14 },
  emptySubtitle: { fontFamily: theme.fontFamily.regular, color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  slideImage: { width: 100, height: 100, marginBottom: theme.spacing.sm },
  slideImagePlaceholder: { fontSize: 48, marginBottom: theme.spacing.sm },
  slideTitle: { fontSize: 15, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary, textAlign: 'center' },
  slidePrice: { fontSize: 15, fontFamily: theme.fontFamily.semiBold, color: theme.colors.primary, marginTop: 4 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: theme.spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.backgroundAlt },
  dotActive: { backgroundColor: theme.colors.primary },
});
