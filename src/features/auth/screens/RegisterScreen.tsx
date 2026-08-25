import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { ApiException } from '../../../core/network/apiException';

const schema = z.object({
  firstName: z.string().min(1, 'Ad gerekli'),
  lastName: z.string().min(1, 'Soyad gerekli'),
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  kvkkApproved: z.boolean().refine((v) => v === true, 'KVKK metnini onaylamanız gerekiyor'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', kvkkApproved: false },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await register(values);
      setSuccess(true);
    } catch (e) {
      setServerError(e instanceof ApiException ? e.message : 'Kayıt olunamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.title}>Kayıt başarılı</Text>
        <Text style={styles.subtitle}>
          Email adresinize doğrulama bağlantısı gönderdik. Lütfen giriş yapmadan önce email
          adresinizi doğrulayın.
        </Text>
        <PrimaryButton title="Girişe dön" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Kayıt ol</Text>
      <Text style={styles.subtitle}>Yeni bir hesap oluşturun</Text>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <AppTextInput label="Ad" value={field.value} onChangeText={field.onChange} />
            )}
          />
        </View>
        <View style={styles.rowItem}>
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <AppTextInput label="Soyad" value={field.value} onChangeText={field.onChange} />
            )}
          />
        </View>
      </View>
      {(errors.firstName || errors.lastName) && (
        <Text style={styles.fieldError}>{errors.firstName?.message || errors.lastName?.message}</Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <AppTextInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.email ? <Text style={styles.fieldError}>{errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <AppTextInput
            label="Telefon"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.phone ? <Text style={styles.fieldError}>{errors.phone.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <AppTextInput
            label="Şifre"
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      {errors.password ? <Text style={styles.fieldError}>{errors.password.message}</Text> : null}

      <Controller
        control={control}
        name="kvkkApproved"
        render={({ field }) => (
          <Pressable style={styles.kvkkRow} onPress={() => field.onChange(!field.value)}>
            <View style={[styles.checkbox, field.value && styles.checkboxChecked]} />
            <Text style={styles.kvkkText}>KVKK aydınlatma metnini ve gizlilik politikasını onaylıyorum</Text>
          </Pressable>
        )}
      />
      {errors.kvkkApproved ? <Text style={styles.fieldError}>{errors.kvkkApproved.message}</Text> : null}

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <PrimaryButton title="Kayıt ol" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />

      <View style={styles.loginRow}>
        <Text style={styles.mutedText}>Zaten hesabınız var mı? </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={styles.linkText}>Giriş yap</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: theme.spacing.lg, paddingTop: theme.spacing.xl },
  successContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  title: { fontSize: 26, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fontFamily.regular,
  },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  rowItem: { flex: 1 },
  fieldError: { color: theme.colors.danger, fontSize: 13, marginTop: -8, marginBottom: 8 },
  serverError: { color: theme.colors.danger, fontSize: 14, marginBottom: theme.spacing.sm, textAlign: 'center' },
  kvkkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  kvkkText: { flex: 1, color: theme.colors.textSecondary, fontSize: 13, fontFamily: theme.fontFamily.regular },
  linkText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium },
  mutedText: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
});
