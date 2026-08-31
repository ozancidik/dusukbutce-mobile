import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { PillOption } from '../data/technicalServiceOptions';

interface Props {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
}

// src/features/submissions/components/DynamicField.tsx'teki 'select' render'ıyla
// aynı görsel desen (chip/pill). Buradan farklı olarak value !== label olabilir
// (örn. kargo firması kodu vs. fiyat/süre içeren etiket).
export function PillSelectField({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.optionChip, isActive && styles.optionChipActive]}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
});
