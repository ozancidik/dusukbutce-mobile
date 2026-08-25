import { useLocalSearchParams } from 'expo-router';
import { ListingDetailScreen } from '../../src/features/listings/screens/ListingDetailScreen';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ListingDetailScreen id={id} />;
}
