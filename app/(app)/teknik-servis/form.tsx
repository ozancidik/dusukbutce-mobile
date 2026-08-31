import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TechnicalServiceFormScreen } from '../../../src/features/technicalService/screens/TechnicalServiceFormScreen';
import { DeliveryMethod } from '../../../src/features/technicalService/api/technicalServiceRepository';
import { theme } from '../../../src/core/theme/theme';

export default function TeknikServisForm() {
  const { serviceType, deliveryMethod } = useLocalSearchParams<{
    serviceType: string;
    deliveryMethod: string;
  }>();

  const isValidDeliveryMethod = deliveryMethod === 'evimden-al' || deliveryMethod === 'kargo-ile-gonder';

  if (!serviceType || !isValidDeliveryMethod) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.danger, fontFamily: theme.fontFamily.medium }}>Servis bulunamadı</Text>
      </View>
    );
  }

  return (
    <TechnicalServiceFormScreen serviceType={serviceType} deliveryMethod={deliveryMethod as DeliveryMethod} />
  );
}
