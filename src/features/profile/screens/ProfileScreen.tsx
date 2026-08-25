import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { profileRepository, ProfileData } from '../api/profileRepository';
import { ApiException } from '../../../core/network/apiException';
import { useAuthStore } from '../../auth/store/authStore';

export function ProfileScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: profileRepository.fetchProfile,
  });

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>Profil bilgileri alınamadı</Text>
      </View>
    );
  }

  return <ProfileForm data={data} />;
}

// data query'den geldiği andan itibaren state'in tek kaynağı bu bileşenin
// kendi state'i olur; ProfileScreen bunu yalnızca data hazır olunca mount
// eder, bu yüzden effect+setState ile senkronize etmeye gerek yok.
function ProfileForm({ data }: { data: ProfileData }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [namePart, ...restParts] = (data.name || '').split(' ');

  const [firstNameValue, setFirstNameValue] = useState(namePart ?? '');
  const [lastNameValue, setLastNameValue] = useState(restParts.join(' '));
  const [phone, setPhone] = useState(data.phone ?? '');
  const [birthDate, setBirthDate] = useState(data.birthDate ?? '');

  const updateMutation = useMutation({
    mutationFn: () =>
      profileRepository.updateProfile({
        firstName: firstNameValue.trim(),
        lastName: lastNameValue.trim(),
        phone: phone.trim(),
        birthDate: data.birthDateEdited ? undefined : birthDate.trim() || undefined,
      }),
    onSuccess: (updated) => {
      setUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        birthDate: updated.birthDate,
        isAdmin: false,
      });
      Alert.alert('Başarılı', 'Profiliniz güncellendi.');
    },
    onError: (e) => Alert.alert('Hata', e instanceof ApiException ? e.message : 'Güncellenemedi'),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>

      <AppTextInput label="Ad" value={firstNameValue} onChangeText={setFirstNameValue} />
      <AppTextInput label="Soyad" value={lastNameValue} onChangeText={setLastNameValue} />

      <View style={styles.readonlyField}>
        <Text style={styles.readonlyLabel}>Email</Text>
        <Text style={styles.readonlyValue}>{data.email}</Text>
      </View>

      <AppTextInput label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      {data.birthDateEdited ? (
        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>Doğum Tarihi</Text>
          <Text style={styles.readonlyValue}>{data.birthDate || '-'}</Text>
        </View>
      ) : (
        <AppTextInput
          label="Doğum Tarihi (GG.AA.YYYY) — yalnızca bir kez girilebilir"
          value={birthDate}
          onChangeText={setBirthDate}
        />
      )}

      <PrimaryButton title="Kaydet" onPress={() => updateMutation.mutate()} isLoading={updateMutation.isPending} />

      <Link href="/profile/addresses" asChild>
        <Pressable style={styles.addressesLink}>
          <Text style={styles.addressesLinkText}>📍 Adreslerim</Text>
          <Text style={styles.addressesLinkChevron}>›</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 60, paddingBottom: theme.spacing.xl },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  errorText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium },
  title: { fontSize: 24, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.lg },
  readonlyField: { marginBottom: theme.spacing.md },
  readonlyLabel: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 4, fontFamily: theme.fontFamily.medium },
  readonlyValue: {
    height: 52,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.regular,
    lineHeight: 52,
  },
  addressesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  addressesLinkText: { fontSize: 15, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  addressesLinkChevron: { fontSize: 20, color: theme.colors.textMuted },
});
