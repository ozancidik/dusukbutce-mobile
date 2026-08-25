import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../../core/theme/theme';

interface Props {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onCancel: () => void;
}

export function PickerModal({ visible, title, options, onSelect, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {visible ? <PickerBody title={title} options={options} onSelect={onSelect} onCancel={onCancel} /> : null}
    </Modal>
  );
}

function PickerBody({ title, options, onSelect, onCancel }: Omit<Props, 'visible'>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return options;
    return options.filter((o) => o.toLocaleLowerCase('tr').includes(q));
  }, [options, query]);

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ara..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>Sonuç bulunamadı</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.optionRow} onPress={() => onSelect(item)}>
              <Text style={styles.optionText}>{item}</Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Vazgeç</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  card: { maxHeight: '75%', backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.card, borderTopRightRadius: theme.radius.card, padding: theme.spacing.lg },
  title: { fontSize: 18, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  searchInput: {
    height: 48,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.sm,
  },
  list: { marginBottom: theme.spacing.sm },
  optionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  optionText: { fontSize: 15, color: theme.colors.textPrimary, fontFamily: theme.fontFamily.regular },
  emptyText: { textAlign: 'center', color: theme.colors.textMuted, paddingVertical: theme.spacing.lg, fontFamily: theme.fontFamily.regular },
  cancelButton: { height: 48, borderRadius: theme.radius.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
});
