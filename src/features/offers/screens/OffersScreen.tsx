import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../../core/theme/theme';
import { offersRepository } from '../api/offersRepository';
import { OfferCard } from '../components/OfferCard';
import { NoteModal } from '../components/NoteModal';
import { ApiException } from '../../../core/network/apiException';

type PendingAction = { id: string; kind: 'reject' | 'reoffer' | 'cancel' } | null;

export function OffersScreen() {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-offers'],
    queryFn: offersRepository.fetchMyOffers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['my-offers'] });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => offersRepository.respond(id, 'accepted'),
    onSuccess: invalidate,
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'İşlem başarısız'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => offersRepository.respond(id, 'rejected', note),
    onSuccess: () => {
      invalidate();
      setPendingAction(null);
    },
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'İşlem başarısız'),
  });

  const reofferMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => offersRepository.reoffer(id, note),
    onSuccess: () => {
      invalidate();
      setPendingAction(null);
    },
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'İşlem başarısız'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => offersRepository.cancel(id, note),
    onSuccess: () => {
      invalidate();
      setPendingAction(null);
    },
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'İşlem başarısız'),
  });

  const isModalSubmitting = rejectMutation.isPending || reofferMutation.isPending || cancelMutation.isPending;

  const handleModalSubmit = (note: string) => {
    if (!pendingAction) return;
    if (pendingAction.kind === 'reject') rejectMutation.mutate({ id: pendingAction.id, note });
    if (pendingAction.kind === 'reoffer') reofferMutation.mutate({ id: pendingAction.id, note });
    if (pendingAction.kind === 'cancel') cancelMutation.mutate({ id: pendingAction.id, note });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tekliflerim</Text>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
      ) : isError ? (
        <View style={styles.centerMessage}>
          <Text style={styles.errorText}>Teklifler getirilemedi</Text>
        </View>
      ) : (data ?? []).length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>Henüz bir talebiniz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <OfferCard
              submission={item}
              onAccept={() => acceptMutation.mutate(item._id)}
              onReject={() => setPendingAction({ id: item._id, kind: 'reject' })}
              onReoffer={() => setPendingAction({ id: item._id, kind: 'reoffer' })}
              onCancel={() => setPendingAction({ id: item._id, kind: 'cancel' })}
            />
          )}
        />
      )}

      <NoteModal
        visible={pendingAction !== null}
        title={
          pendingAction?.kind === 'reject'
            ? 'Reddetme Nedeni'
            : pendingAction?.kind === 'reoffer'
              ? 'Yeniden Teklif Talebi'
              : 'İptal Nedeni'
        }
        label={pendingAction?.kind === 'reoffer' ? 'Talebiniz' : 'Not (opsiyonel)'}
        required={pendingAction?.kind === 'reoffer'}
        isSubmitting={isModalSubmitting}
        onCancel={() => setPendingAction(null)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, paddingTop: 60, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  loading: { marginTop: theme.spacing.xl },
  centerMessage: { alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.xl, gap: theme.spacing.sm },
  errorText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
});
