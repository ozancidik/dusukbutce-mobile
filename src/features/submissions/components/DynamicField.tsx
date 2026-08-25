import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FieldConfig } from '../config/categoryFormConfigs';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { theme } from '../../../core/theme/theme';

interface Props {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function DynamicField({ field, value, onChange }: Props) {
  if (field.type === 'boolean') {
    const isOn = value === true;
    return (
      <Pressable style={styles.booleanRow} onPress={() => onChange(!isOn)}>
        <View style={[styles.checkbox, isOn && styles.checkboxChecked]} />
        <Text style={styles.booleanLabel}>{field.label}</Text>
      </Pressable>
    );
  }

  if (field.type === 'select') {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{field.label}</Text>
        <View style={styles.optionsRow}>
          {(field.options ?? []).map((option) => {
            const isActive = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                style={[styles.optionChip, isActive && styles.optionChipActive]}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <AppTextInput
      label={field.label}
      value={typeof value === 'string' ? value : ''}
      onChangeText={onChange}
      keyboardType={field.keyboardType === 'numeric' ? 'numeric' : 'default'}
      multiline={field.type === 'textarea'}
      style={field.type === 'textarea' ? styles.textarea : undefined}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: theme.fontFamily.medium },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  optionText: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
  optionTextActive: { color: theme.colors.white },
  booleanRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: theme.colors.border },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  booleanLabel: { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.regular, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 14 },
});
