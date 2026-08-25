import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { theme } from '../../core/theme/theme';
import { useAuthStore } from '../auth/store/authStore';

interface MenuItem {
  icon: string;
  label: string;
  href?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '🏷️', label: 'Satılık İlanlar', href: '/listings' },
  { icon: '💰', label: 'Bize Sat' },
  { icon: '📋', label: 'Tekliflerim' },
  { icon: '👤', label: 'Profil' },
];

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Pressable onPress={() => logout()}>
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </Pressable>
      </View>

      <View style={styles.menuGrid}>
        {MENU_ITEMS.map((item) =>
          item.href ? (
            <Link key={item.label} href={item.href as never} asChild>
              <Pressable style={styles.menuTile}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            </Link>
          ) : (
            <View key={item.label} style={[styles.menuTile, styles.menuTileDisabled]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabelDisabled}>{item.label}</Text>
              <Text style={styles.comingSoon}>Yakında</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg, paddingTop: 70 },
  profileCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  name: { fontSize: 20, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  email: { fontSize: 14, color: theme.colors.textMuted, marginTop: 2, marginBottom: theme.spacing.sm, fontFamily: theme.fontFamily.regular },
  logoutText: { color: theme.colors.danger, fontFamily: theme.fontFamily.medium, fontSize: 14 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  menuTile: {
    width: '47%',
    aspectRatio: 1.1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  menuTileDisabled: { backgroundColor: theme.colors.backgroundAlt, opacity: 0.6 },
  menuIcon: { fontSize: 32 },
  menuLabel: { fontSize: 14, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  menuLabelDisabled: { fontSize: 14, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textMuted },
  comingSoon: { fontSize: 11, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
});
