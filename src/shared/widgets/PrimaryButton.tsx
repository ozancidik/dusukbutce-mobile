import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../core/theme/theme';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({ title, onPress, isLoading, disabled, variant = 'primary' }: Props) {
  const isDisabled = disabled || isLoading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.primary} />
      ) : (
        <Text style={variant === 'primary' ? styles.textPrimary : styles.textSecondary}>{title}</Text>
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
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  textPrimary: {
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
