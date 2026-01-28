import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { View, Platform, StatusBar } from 'react-native'; // Import StatusBar
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; 

// NEW IMPORTS FOR SAFE AREA
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { RefreshProvider } from '../context/RefreshContext'; 
import { ThemeProvider } from '../utilities/ThemeContext'; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RefreshProvider>
        {/* 1. Provider gives context to the whole app */}
        <SafeAreaProvider>
            
            {/* 2. SafeAreaView with edges=['top'] pushes EVERYTHING down below the camera */}
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                
                {/* Optional: explicit status bar styling */}
                <StatusBar barStyle="dark-content" /> 
                
                <Slot />
            </SafeAreaView>
        </SafeAreaProvider>
      </RefreshProvider>
    </ThemeProvider>
  );
}