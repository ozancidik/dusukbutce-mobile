import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { addressesRepository } from '../api/addressesRepository';
import { AddressFormModal } from '../components/AddressFormModal';
import { Address } from '../../../shared/models/Address';
import { ApiException } from '../../../core/network/apiException';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';

export function AddressesScreen() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesRepository.fetchAll,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const saveMutation = useMutation({
    mutationFn: (address: Address) =>
      editingAddress?._id ? addressesRepository.update(editingAddress._id, address) : addressesRepository.create(address),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingAddress(null);
    },
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'Kaydedilemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesRepository.remove(id),
    onSuccess: invalidate,
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'Silinemedi'),
  });

  const confirmDelete = (address: Address) => {
    Alert.alert('Adresi sil', `"${address.title}" adresini silmek istediğinize emin misiniz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMutation.mutate(address._id!) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'} Geri</Text>
      </Pressable>
      <Text style={styles.title}>Adreslerim</Text>

      <View style={styles.addButtonWrapper}>
        <PrimaryButton
          title="+ Yeni Adres Ekle"
          variant="secondary"
          onPress={() => {
            setEditingAddress(null);
            setModalOpen(true);
          }}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
      ) : isError ? (
        <Text style={styles.errorText}>Adresler alınamadı</Text>
      ) : (data ?? []).length === 0 ? (
        <View style={styles.centerMessage}>
          <Text style={styles.emptyText}>Henüz kayıtlı bir adresiniz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item._id ?? String(index)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardBody}>{item.fullName} · {item.phone}</Text>
              <Text style={styles.cardBody}>
                {item.address}, {item.district}/{item.city}
              </Text>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    setEditingAddress(item);
                    setModalOpen(true);
                  }}
                >
                  <Text style={styles.editText}>Düzenle</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item)}>
                  <Text style={styles.deleteText}>Sil</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <AddressFormModal
        visible={modalOpen}
        initial={editingAddress}
        isSubmitting={saveMutation.isPending}
        onCancel={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={(address) => saveMutation.mutate(address)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  backButton: { paddingTop: 60, paddingHorizontal: theme.spacing.lg },
  backText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium, fontSize: 15 },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.sm },
  addButtonWrapper: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.md, marginBottom: theme.spacing.md },
  loading: { marginTop: theme.spacing.xl },
  errorText: { color: theme.colors.danger, textAlign: 'center', marginTop: theme.spacing.xl, fontFamily: theme.fontFamily.medium },
  centerMessage: { alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.xl },
  emptyText: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  defaultBadge: { backgroundColor: `${theme.colors.success}1A`, borderWidth: 1, borderColor: theme.colors.success, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 10, color: theme.colors.success, fontFamily: theme.fontFamily.semiBold },
  cardBody: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
  editText: { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
  deleteText: { color: theme.colors.danger, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
});
