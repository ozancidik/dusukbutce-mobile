import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../../core/theme/theme';

interface Props extends TextInputProps {
  label: string;
}

export const AppTextInput = forwardRef<TextInput, Props>(({ label, style, ...rest }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {isFocused ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholder={isFocused ? undefined : label}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, isFocused && styles.inputFocused, style]}
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        {...rest}
      />
    </View>
  );
});
AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    color: theme.colors.primary,
    marginBottom: 4,
    fontFamily: theme.fontFamily.medium,
  },
  input: {
    height: 52,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.fontFamily.regular,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
});
