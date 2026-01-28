import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Import Theme
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

const BottomBar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Gets the current route
  
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'home', 
      route: '/drive/all',
      // Matches both 'all' and generic 'my-drive' views
      match: ['/drive/all', '/drive/my-drive'] 
    },
    { 
      id: 'starred', 
      label: 'Starred', 
      icon: 'star-outline', 
      activeIcon: 'star', 
      route: '/drive/starred',
      match: ['/drive/starred']
    },
    { 
      id: 'shared', 
      label: 'Shared', 
      icon: 'people-outline', 
      activeIcon: 'people',
      route: '/drive/shared-with-me',
      match: ['/drive/shared-with-me']
    },
  ];

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.bgForm, 
        borderTopColor: theme.borderSubtle 
      }
    ]}>
      {tabs.map((tab) => {
        // Check if current path includes any of the match strings
        const isActive = tab.match.some(path => pathname.includes(path));

        const activeColor = theme.brandBlue;
        const inactiveColor = theme.textSecondary;
        // Background Pill: Light Blue in Light Mode, Dark Blue/Grey in Dark Mode
        const pillBackground = isActive ? (isDarkMode ? '#1a2335' : '#e8f0fe') : 'transparent';

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => router.replace(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: pillBackground }]}>
              <MaterialIcons
                name={(isActive && tab.activeIcon ? tab.activeIcon : tab.icon) as any}
                size={24}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            
            <Text style={[
              styles.tabLabel, 
              { color: isActive ? activeColor : inactiveColor }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    // Shadows
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Add extra padding at bottom for iPhone Home Indicator
    paddingBottom: Platform.OS === 'ios' ? 0 : 8, 
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BottomBar;