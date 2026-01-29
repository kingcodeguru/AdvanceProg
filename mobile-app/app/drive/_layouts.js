import React from 'react';
import { Tabs } from 'expo-router';
import { View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { RefreshProvider } from '../../context/RefreshContext';
import Themes from '../../styles/themes';

export default function DriveLayout() {
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];

  return (
    <RefreshProvider>
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        <Tabs
          screenOptions={{
            // 1. HIDE the default top header (We have our own Navbar now)
            headerShown: false,

            // 2. REMOVED sceneContainerStyle (Moved to DriveScreen.js)
            // This ensures the Navbar can stretch full width
            
            // Bottom Tab Styling
            tabBarStyle: {
              backgroundColor: theme.bgMain,
              borderTopColor: theme.borderSubtle,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: theme.brandBlue,
            tabBarInactiveTintColor: theme.textSecondary,
          }}
        >
          <Tabs.Screen
            name="all"
            options={{
              title: 'Files',
              tabBarIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={size} color={color} />,
            }}
          />

          <Tabs.Screen
            name="recent"
            options={{
              title: 'Recent',
              tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
            }}
          />

          <Tabs.Screen
            name="trash"
            options={{
              title: 'Trash',
              tabBarIcon: ({ color, size }) => <Ionicons name="trash-outline" size={size} color={color} />,
            }}
          />

          {/* Editor Route */}
          <Tabs.Screen
            name="files/[id]"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
              // No need to reset margins because we removed them globally!
            }}
          />
        </Tabs>
      </View>
    </RefreshProvider>
  );
}