import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { useAuthStore } from '../store/authStore';
import { ApiException } from '../../../core/network/apiException';

const schema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});
type FormValues = z.infer<typeof schema>;

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      router.replace('/(app)');
    } catch (e) {
      setServerError(e instanceof ApiException ? e.message : 'Giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Giriş yap</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

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
          name="password"
          render={({ field }) => (
            <AppTextInput
              label="Şifre"
              secureTextEntry={!showPassword}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.password ? <Text style={styles.fieldError}>{errors.password.message}</Text> : null}

        <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.togglePassword}>
          <Text style={styles.linkText}>{showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}</Text>
        </Pressable>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable style={styles.forgotLink}>
            <Text style={styles.linkText}>Şifremi unuttum</Text>
          </Pressable>
        </Link>

        <PrimaryButton title="Giriş yap" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />

        <View style={styles.registerRow}>
          <Text style={styles.mutedText}>Hesabınız yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>Kayıt olun</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { flexGrow: 1, padding: theme.spacing.lg, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fontFamily.regular,
  },
  fieldError: { color: theme.colors.danger, fontSize: 13, marginTop: -8, marginBottom: 8 },
  serverError: {
    color: theme.colors.danger,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  togglePassword: { alignSelf: 'flex-end', marginTop: -8, marginBottom: theme.spacing.md },
  forgotLink: { alignSelf: 'flex-end', marginBottom: theme.spacing.lg },
  linkText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium },
  mutedText: { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
});
