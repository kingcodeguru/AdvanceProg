import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function ImageViewer() {
  const { id } = useLocalSearchParams();
  return <View><Text>Viewing image {id}</Text></View>;
}