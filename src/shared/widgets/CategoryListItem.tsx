import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../core/theme/theme';

interface Props {
  icon: string;
  name: string;
  onPress: () => void;
  badge?: string;
}

// dusukbutce.com anasayfasındaki ikon + isim satırı (Bize Sat kategorileri ve
// Teknik Servis kategorileri için birebir aynı görsel desen).
export function CategoryListItem({ icon, name, onPress, badge }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.name}>{name}</Text>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowPressed: { backgroundColor: theme.colors.backgroundAlt },
  icon: { fontSize: 22, marginRight: theme.spacing.sm },
  name: { flex: 1, fontSize: 15, fontFamily: theme.fontFamily.medium, color: theme.colors.textSecondary },
  badge: { fontSize: 11, fontFamily: theme.fontFamily.regular, color: theme.colors.textMuted },
});
