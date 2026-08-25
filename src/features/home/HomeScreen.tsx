import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../core/theme/theme';
import { useAuthStore } from '../auth/store/authStore';

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Pressable style={styles.logoutButton} onPress={() => logout()}>
        <Text style={styles.logoutText}>Çıkış yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: 80 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  name: { fontSize: 20, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  email: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, fontFamily: theme.fontFamily.regular },
  logoutButton: { alignSelf: 'flex-start' },
  logoutText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium, fontSize: 15 },
});
