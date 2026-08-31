import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { DeliveryMethod } from '../api/technicalServiceRepository';
import { HomeCategoryItem } from '../../home/data/homeCategories';

interface Props {
  visible: boolean;
  service: HomeCategoryItem | null;
  onSelect: (method: DeliveryMethod) => void;
  onCancel: () => void;
}

// dusukbutce.com'daki her servis kartının altındaki iki buton
// (components/ServiceCard.tsx): "🏠 Evimden Al" / "📦 Kargo ile Gönder".
export function DeliveryMethodSheet({ visible, service, onSelect, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.icon}>{service?.icon ?? '🛠️'}</Text>
          <Text style={styles.title}>{service?.name}</Text>
          <Text style={styles.subtitle}>Teslimat yöntemini seçin</Text>

          <Pressable style={[styles.option, styles.optionHome]} onPress={() => onSelect('evimden-al')}>
            <Text style={styles.optionText}>🏠 Evimden Al</Text>
          </Pressable>
          <Pressable style={[styles.option, styles.optionCargo]} onPress={() => onSelect('kargo-ile-gonder')}>
            <Text style={styles.optionText}>📦 Kargo ile Gönder</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Vazgeç</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 18, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular, marginBottom: theme.spacing.sm },
  option: {
    width: '100%',
    height: 52,
    borderRadius: theme.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionHome: { backgroundColor: theme.colors.successLight },
  optionCargo: { backgroundColor: theme.colors.primary },
  optionText: { color: theme.colors.white, fontSize: 16, fontFamily: theme.fontFamily.semiBold },
  cancelButton: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.xs },
  cancelText: { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
});
