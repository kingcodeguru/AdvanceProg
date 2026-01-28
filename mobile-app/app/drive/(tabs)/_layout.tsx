import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        
        // Tab Bar Styling
        tabBarStyle: {
          backgroundColor: theme.bgForm,
          borderTopColor: theme.borderSubtle,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        
        // Colors
        tabBarActiveTintColor: theme.brandBlue,
        tabBarInactiveTintColor: theme.textSecondary,
        
        // Labels
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* ORDER MATTERS HERE: 
         1. Home 
         2. Starred 
         3. Shared 
      */}

      {/* Tab 1: Home */}
      <Tabs.Screen
        name="home" // Matches file: app/(tabs)/home.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            // 'home' exists in MaterialIcons. Using same icon for active/inactive is standard for Home.
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />

      {/* Tab 2: Starred */}
      <Tabs.Screen
        name="starred" // Matches file: app/(tabs)/starred.tsx
        options={{
          title: 'Starred',
          tabBarIcon: ({ color, focused }) => (
            // 'star' vs 'star-border' (outline)
            <MaterialIcons name={focused ? "star" : "star-border"} size={26} color={color} />
          ),
        }}
      />

      {/* Tab 3: Shared */}
      <Tabs.Screen
        name="shared" // Matches file: app/(tabs)/shared.tsx
        options={{
          title: 'Shared',
          tabBarIcon: ({ color, focused }) => (
            // 'people' vs 'people-outline'
            <MaterialIcons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}