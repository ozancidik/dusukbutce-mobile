import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';

interface Props {
  visible: boolean;
  title: string;
  label: string;
  required?: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (note: string) => void;
}

export function NoteModal({ visible, title, label, required, isSubmitting, onCancel, onSubmit }: Props) {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (required && !note.trim()) return;
    onSubmit(note.trim());
    setNote('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <AppTextInput
            label={label}
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.textarea}
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Vazgeç</Text>
            </Pressable>
            <View style={styles.submitButton}>
              <PrimaryButton title="Gönder" onPress={handleSubmit} isLoading={isSubmitting} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  card: { width: '100%', backgroundColor: theme.colors.white, borderRadius: theme.radius.card, padding: theme.spacing.lg },
  title: { fontSize: 17, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 14 },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  cancelButton: { flex: 1, height: 48, borderRadius: theme.radius.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
  submitButton: { flex: 1 },
});
