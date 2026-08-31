import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../core/theme/theme';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'md' | 'lg';
}

const VARIANT_STYLES = {
  primary: { container: 'primary' as const, text: 'textOnColor' as const },
  secondary: { container: 'secondary' as const, text: 'textSecondary' as const },
  success: { container: 'success' as const, text: 'textOnColor' as const },
  danger: { container: 'danger' as const, text: 'textOnColor' as const },
};

export function PrimaryButton({ title, onPress, isLoading, disabled, variant = 'primary', size = 'md' }: Props) {
  const isDisabled = disabled || isLoading;
  const { container, text } = VARIANT_STYLES[variant];
  const isLight = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.baseLg,
        styles[container],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={isLight ? theme.colors.primary : theme.colors.white} />
      ) : (
        <Text style={[styles[text], size === 'lg' && styles.textLg]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: theme.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  baseLg: {
    height: 56,
    borderRadius: theme.radius.card,
  },
  textLg: {
    fontSize: 19,
    letterSpacing: 0.5,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  success: {
    backgroundColor: theme.colors.successLight,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  textOnColor: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  textSecondary: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
});
