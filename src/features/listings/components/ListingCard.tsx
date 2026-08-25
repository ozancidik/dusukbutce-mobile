import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { Listing, getListingTitle } from '../../../shared/models/Listing';
import { getCategoryLabel } from '../categories';

interface Props {
  listing: Listing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: Props) {
  const title = getListingTitle(listing);
  const price = listing.listing?.price;
  const imageUri = listing.images?.[0];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.imagePlaceholder}>🖼️</Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.price}>
        {typeof price === 'number' ? `${price.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok'}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{getCategoryLabel(listing.category)}</Text>
        {listing.cosmeticCondition ? (
          <>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{listing.cosmeticCondition}</Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
  },
  imageWrapper: {
    height: 120,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 40 },
  title: {
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    minHeight: 36,
  },
  price: {
    fontSize: 17,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.danger,
    marginBottom: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
  metaDot: { fontSize: 12, color: theme.colors.textMuted, marginHorizontal: 4 },
});
