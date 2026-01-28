import { Slot } from 'expo-router';
import { View } from 'react-native';
import { RefreshProvider } from '../context/RefreshContext'; 
import { ThemeProvider } from '../utilities/ThemeContext'; 

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RefreshProvider>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </RefreshProvider>
    </ThemeProvider>
  );
}