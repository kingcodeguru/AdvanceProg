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
        tabBarStyle: {
          backgroundColor: theme.bgForm,
          borderTopColor: theme.borderSubtle,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 4, 
          paddingRight: 0.5 
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
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="starred"
        options={{
          title: 'Starred',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? "star" : "star-border"} size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shared"
        options={{
          title: 'Shared',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}