import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { listingsRepository } from '../api/listingsRepository';
import { getCategoryLabel } from '../categories';
import { getListingTitle } from '../../../shared/models/Listing';
import { getPriceEstimate, type PerplexityAnswer } from '../../../core/ai/perplexity';

interface Props {
  id: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function ListingDetailScreen({ id }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [priceConsultant, setPriceConsultant] = useState<PerplexityAnswer | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsRepository.fetchListing(id),
  });

  const handlePriceConsultant = async () => {
    if (!listing) return;
    setIsLoadingPrice(true);
    try {
      const title = getListingTitle(listing);
      const result = await getPriceEstimate(title);
      setPriceConsultant(result);
    } catch (error) {
      setPriceConsultant({
        answer: 'Fiyat danışmanı şu anda kullanılabilir değil.',
        sources: [],
        status: 'error',
      });
    } finally {
      setIsLoadingPrice(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>İlan bulunamadı.</Text>
      </View>
    );
  }

  const title = getListingTitle(listing);
  const price = listing.listing?.price;
  const images = listing.images ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'} Geri</Text>
      </Pressable>

      <View style={styles.imageWrapper}>
        {images.length > 0 ? (
          <Image source={{ uri: images[activeImage] }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.imagePlaceholder}>🖼️</Text>
        )}
      </View>

      {images.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {images.map((uri, index) => (
            <Pressable key={uri + index} onPress={() => setActiveImage(index)}>
              <Image
                source={{ uri }}
                style={[styles.thumb, index === activeImage && styles.thumbActive]}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>
        {typeof price === 'number' ? `${price.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok'}
      </Text>

      <View style={styles.infoCard}>
        <InfoRow label="Kategori" value={getCategoryLabel(listing.category)} />
        <InfoRow label="Marka" value={listing.brand || '-'} />
        <InfoRow label="Model" value={listing.model || '-'} />
        <InfoRow label="Kozmetik Durum" value={listing.cosmeticCondition || '-'} />
        <InfoRow
          label="Garanti"
          value={listing.hasWarranty ? `Var${listing.warrantyDuration ? ` (${listing.warrantyDuration})` : ''}` : 'Yok'}
        />
        <InfoRow label="Kutu" value={listing.hasBox ? 'Var' : 'Yok'} />
        <InfoRow
          label="Fatura"
          value={listing.hasInvoice ? `Var${listing.invoiceDate ? ` (${listing.invoiceDate})` : ''}` : 'Yok'}
        />
      </View>

      {listing.listing?.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionLabel}>Açıklama</Text>
          <Text style={styles.descriptionText}>{listing.listing.description}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={handlePriceConsultant}
        disabled={isLoadingPrice}
        style={[styles.consultantButton, isLoadingPrice && styles.consultantButtonDisabled]}
      >
        {isLoadingPrice ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <Text style={styles.consultantButtonText}>💰 Fiyat Danışmanı</Text>
        )}
      </Pressable>

      {priceConsultant && (
        <View style={[styles.consultantCard, priceConsultant.status === 'error' && styles.consultantCardError]}>
          <Text style={styles.consultantTitle}>Pazar Değeri Analizi</Text>
          <Text style={styles.consultantAnswer}>{priceConsultant.answer}</Text>
          {priceConsultant.sources && priceConsultant.sources.length > 0 && (
            <View style={styles.sourcesList}>
              <Text style={styles.sourcesLabel}>Kaynaklar:</Text>
              {priceConsultant.sources.map((source, idx) => (
                source.url && (
                  <Text key={idx} style={styles.sourceUrl}>
                    {source.title || source.url}
                  </Text>
                )
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 60, paddingBottom: theme.spacing.xl },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  errorText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium },
  backButton: { marginBottom: theme.spacing.md },
  backText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium, fontSize: 15 },
  imageWrapper: {
    height: 240,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 56 },
  thumbRow: { marginTop: theme.spacing.sm },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbActive: { borderColor: theme.colors.primary, borderWidth: 2 },
  title: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
  },
  price: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.danger, marginTop: 4, marginBottom: theme.spacing.md },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular, fontSize: 14 },
  infoValue: { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.semiBold, fontSize: 14 },
  descriptionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  descriptionLabel: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 6, fontFamily: theme.fontFamily.medium },
  descriptionText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontFamily: theme.fontFamily.regular },
  consultantButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  consultantButtonDisabled: { opacity: 0.6 },
  consultantButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  consultantCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  consultantCardError: { backgroundColor: theme.colors.background },
  consultantTitle: {
    fontSize: 14,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  consultantAnswer: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.sm,
  },
  sourcesList: { marginTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm },
  sourcesLabel: { fontSize: 12, fontFamily: theme.fontFamily.medium, color: theme.colors.textMuted, marginBottom: 4 },
  sourceUrl: { fontSize: 12, color: theme.colors.primary, fontFamily: theme.fontFamily.regular, marginVertical: 2 },
});
