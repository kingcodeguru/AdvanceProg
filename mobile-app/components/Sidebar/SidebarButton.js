import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Themes from '../../styles/themes'; // Adjust path if needed

// Map labels to your actual routes
const TITLE_TO_PATH = { 
  'Home': 'all',
  'My Drive': 'my-drive', 
  'Shared with me': 'shared-with-me', 
  'Recent': 'recent', 
  'Starred': 'starred', 
  'Trash': 'trash' // Make sure this matches your filename (trash.js vs bin.js)
};

const ICON_MAP = {
  'Home': 'home-outline',
  'My Drive': 'server-outline',
  'Shared with me': 'people-outline',
  'Recent': 'time-outline',
  'Starred': 'star-outline',
  'Trash': 'trash-outline'
};

export default function SidebarButton({ label, onPress }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const categoryPath = TITLE_TO_PATH[label] || 'all';
  const fullPath = `/drive/${categoryPath}`;
  
  // Check if active (simple check)
  const isActive = pathname.includes(categoryPath);

  const handlePress = () => {
    router.push(fullPath);
    if (onPress) onPress(); // Close sidebar after clicking
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.activeContainer,
        pressed && styles.pressed
      ]}
    >
      <Ionicons 
        name={ICON_MAP[label] || 'folder-outline'} 
        size={22} 
        color={isActive ? '#1a73e8' : '#5f6368'} 
        style={styles.icon}
      />
      <Text style={[styles.text, isActive && styles.activeText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 8, // Gap on the right like web
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  activeContainer: {
    backgroundColor: '#e8f0fe', // Active Blue Light
  },
  pressed: {
    backgroundColor: '#f1f3f4',
  },
  icon: {
    marginRight: 16,
  },
  text: {
    fontSize: 14,
    color: '#3c4043',
    fontWeight: '500',
  },
  activeText: {
    color: '#1a73e8',
    fontWeight: '600',
  }
});