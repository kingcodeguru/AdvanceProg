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
            // ... (Keep your existing headerStyle, titleStyle, etc.)
            headerStyle: {
              backgroundColor: theme.bgMain,
              elevation: 0, 
              shadowOpacity: 0, 
              borderBottomWidth: 0,
            },
            headerTitleStyle: {
              color: theme.textMain,
              fontWeight: '600',
              fontSize: 20,
            },
            headerTitle: "My Cloud",
            tabBarStyle: {
              backgroundColor: theme.bgMain,
              borderTopColor: theme.borderSubtle,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: theme.brandBlue,
            tabBarInactiveTintColor: theme.textSecondary,
            
            // ... (Keep your existing sceneContainerStyle)
            sceneContainerStyle: {
              backgroundColor: theme.bgPrimary, 
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16, 
              borderBottomLeftRadius: 16, 
              borderBottomRightRadius: 16,
              marginTop: 10,
              marginHorizontal: 10, 
              marginBottom: 10, 
              overflow: 'hidden',
              elevation: 2, 
              shadowColor: '#000', 
              shadowOpacity: 0.05,
              shadowRadius: 5,
            }
          }}
        >
          {/* Tab 1: All Files */}
          <Tabs.Screen
            name="all"
            options={{
              title: 'Files',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="folder-open-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Tab 2: Recent */}
          <Tabs.Screen
            name="recent"
            options={{
              title: 'Recent',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />

          {/* Tab 3: Trash */}
          <Tabs.Screen
            name="trash"
            options={{
              title: 'Trash',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trash-outline" size={size} color={color} />
              ),
            }}
          />

          {/* --- HIDDEN EDITOR ROUTE --- */}
          <Tabs.Screen
            name="files/[id]" // Matches the file path: app/drive/files/[id].js
            options={{
              // 1. Hide it from the bottom tab button list
              href: null, 
              // 2. Hide the tab bar itself when this screen is active
              tabBarStyle: { display: 'none' },
              // 3. Hide the standard header (TextEditor has its own custom header)
              headerShown: false,
              // 4. Remove the "card" margins so the editor is truly full screen
              sceneContainerStyle: { 
                 backgroundColor: theme.bgMain,
                 marginTop: 0,
                 marginHorizontal: 0,
                 marginBottom: 0,
                 borderRadius: 0 
              }
            }}
          />

        </Tabs>
      </View>
    </RefreshProvider>
  );
}