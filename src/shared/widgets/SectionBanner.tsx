import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../core/theme/theme';

interface Props {
  title: string;
  subtitle?: string;
}

// dusukbutce.com anasayfasındaki amber gradient banner + kırmızı ok aksanı.
// Hem "2. El Ürününü" (BİZE SAT üstü) hem "Uzman Ekibimizden Destek Al"
// (TEKNİK SERVİS üstü) bölümlerinde tekrar ettiği için paylaşılan widget.
export function SectionBanner({ title, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[theme.colors.warning, theme.colors.background]}
        style={styles.banner}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  banner: {
    width: '100%',
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: theme.colors.warning,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  arrow: {
    marginTop: -14,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.danger,
  },
});
