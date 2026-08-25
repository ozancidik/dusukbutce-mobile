import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SubmissionFormScreen } from '../../../src/features/submissions/screens/SubmissionFormScreen';
import { getCategoryFormConfig } from '../../../src/features/submissions/config/categoryFormConfigs';
import { theme } from '../../../src/core/theme/theme';

export default function SellCategory() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const config = getCategoryFormConfig(category);

  if (!config) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fontFamily.medium }}>Kategori bulunamadı</Text>
      </View>
    );
  }

  return <SubmissionFormScreen config={config} />;
}
