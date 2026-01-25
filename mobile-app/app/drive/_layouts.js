import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { RefreshProvider } from '../../context/RefreshContext';
import Themes from '../../styles/themes';

export default function DriveLayout() {
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];

  return (
    <RefreshProvider>
      {/* The Main Container (Your 'main-page-container') */}
      <View style={{ flex: 1, backgroundColor: theme.bgMain }}>
        
        <Tabs
          screenOptions={{
            // --- Navbar Styling (Top Bar) ---
            headerStyle: {
              backgroundColor: theme.bgMain, // Matches 'bg-navbar'
              elevation: 0, // Remove shadow on Android
              shadowOpacity: 0, // Remove shadow on iOS
              borderBottomWidth: 0,
            },
            headerTitleStyle: {
              color: theme.textMain,
              fontWeight: '600',
              fontSize: 20,
            },
            headerTitle: "My Cloud", // Default Title

            // --- Bottom Bar Styling ---
            tabBarStyle: {
              backgroundColor: theme.bgMain,
              borderTopColor: theme.borderSubtle,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: theme.brandBlue,
            tabBarInactiveTintColor: theme.textSecondary,
            
            // --- Content Area Styling (Your 'content-area' CSS) ---
            // This applies to the View wrapping your page content
            sceneContainerStyle: {
              backgroundColor: theme.bgPrimary, 
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16, // Added for symmetry on mobile
              borderBottomLeftRadius: 16, // Added for mobile "card" look
              borderBottomRightRadius: 16,
              marginTop: 10,
              marginHorizontal: 10, // Left/Right margins
              marginBottom: 10, // Space above bottom bar
              overflow: 'hidden',
              elevation: 2, // Shadow for Android
              shadowColor: '#000', // Shadow for iOS
              shadowOpacity: 0.05,
              shadowRadius: 5,
            }
          }}
        >
          {/* Tab 1: All Files */}
          <Tabs.Screen
            name="all" // Files: app/drive/all.js
            options={{
              title: 'Files',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="folder-open-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Tab 2: Recent */}
          <Tabs.Screen
            name="recent" // Files: app/drive/recent.js
            options={{
              title: 'Recent',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Tab 3: Trash */}
          <Tabs.Screen
            name="trash" // Files: app/drive/trash.js
            options={{
              title: 'Trash',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trash-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Hiding specific routes from the Tab Bar if needed
              For example, if you add file viewing routes here later. 
          */}
        </Tabs>
      </View>
    </RefreshProvider>
  );
}