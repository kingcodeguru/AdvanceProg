import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';
import { Platform } from 'react-native';
// 1. Import the hook to get safe area dimensions
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];
  
  // 2. Get the safe area insets (top, bottom, left, right)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        
        tabBarStyle: {
          backgroundColor: theme.bgForm,
          borderTopColor: theme.borderSubtle,
          
          // 3. DYNAMIC HEIGHT CALCULATION
          // Base height (60) + The exact height of the system buttons/home indicator
          height: 60 + insets.bottom, 
          
          // 4. DYNAMIC PADDING
          // Push the icons up by the system button height + 4px extra breathing room
          paddingBottom: insets.bottom + 4, 
          paddingTop: 8,
        },
        
        tabBarItemStyle: {
            paddingBottom: 4, 
        },
        
        tabBarActiveTintColor: theme.brandBlue,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />

      {/* Tab 2: Starred */}
      <Tabs.Screen
        name="starred"
        options={{
          title: 'Starred',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? "star" : "star-border"} size={26} color={color} />
          ),
        }}
      />

      {/* Tab 3: Shared */}
      <Tabs.Screen
        name="shared"
        options={{
          title: 'Shared',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="folder-shared" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}