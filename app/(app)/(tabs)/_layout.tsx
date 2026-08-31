import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { theme } from '../../../src/core/theme/theme';

// (app)/(tabs) grubu: oturum açmış kullanıcının gördüğü 4 sekmeli alt tab bar.
// "sell/" (Bize Sat) ve "profile/addresses" bu grubun DIŞINDA, (app) seviyesinde
// kalır — böylece tab bar'ın üstüne tam ekran stack olarak açılırlar.
function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: theme.colors.white, borderTopColor: theme.colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Anasayfa', tabBarIcon: () => <TabIcon emoji="🏠" /> }}
      />
      <Tabs.Screen
        name="ilanlar"
        options={{ title: 'İlanlar', tabBarIcon: () => <TabIcon emoji="🏷️" /> }}
      />
      <Tabs.Screen
        name="offers"
        options={{ title: 'Teklifler', tabBarIcon: () => <TabIcon emoji="📋" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: () => <TabIcon emoji="👤" /> }}
      />
    </Tabs>
  );
}
