import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function TextEditor() {
  const { id } = useLocalSearchParams();
  return <View><Text>Editing file {id}</Text></View>;
}