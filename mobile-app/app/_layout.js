import { Slot } from 'expo-router';
import { View } from 'react-native';
import { RefreshProvider } from '../context/RefreshContext'; 

export default function RootLayout() {
  return (
    // Provide the context to the WHOLE app
    <RefreshProvider>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </RefreshProvider>
  );
}