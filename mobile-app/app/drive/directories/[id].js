import DriveScreen from '../../../components/DriveScreen';
import { useLocalSearchParams } from 'expo-router';

export default function DirectoryPage() {
  const { id } = useLocalSearchParams();
  return <DriveScreen folderId={id} />;
}