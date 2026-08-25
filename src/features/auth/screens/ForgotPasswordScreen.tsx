import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { ApiException } from '../../../core/network/apiException';

const schema = z.object({ email: z.string().email('Geçerli bir email adresi girin') });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordScreen() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch (e) {
      setServerError(e instanceof ApiException ? e.message : 'İstek gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </Pressable>
      <Text style={styles.title}>Şifremi unuttum</Text>

      {sent ? (
        <Text style={styles.subtitle}>
          Email adresinize şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.
        </Text>
      ) : (
        <>
          <Text style={styles.subtitle}>Email adresinizi girin, şifre sıfırlama bağlantısı gönderelim.</Text>
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
          {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
          <PrimaryButton title="Gönder" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: 60 },
  backButton: { marginBottom: theme.spacing.md },
  backText: { fontSize: 24, color: theme.colors.textPrimary },
  title: { fontSize: 22, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fontFamily.regular,
  },
  fieldError: { color: theme.colors.danger, fontSize: 13, marginTop: -8, marginBottom: 8 },
  serverError: { color: theme.colors.danger, fontSize: 14, marginBottom: theme.spacing.sm, textAlign: 'center' },
});
