import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Themes from '../../styles/themes'; 
import { useTheme } from '../../utilities/ThemeContext';

// Map labels to your actual routes
const TITLE_TO_PATH = { 
  'Home': 'all',
  'My Drive': 'my-drive', 
  'Shared with me': 'shared-with-me', 
  'Recent': 'recent', 
  'Starred': 'starred', 
  'Trash': 'trash'
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
  const { isDarkMode } = useTheme();
  // Get the current theme object
  const theme = Themes[isDarkMode ? 'dark' : 'light'];
  
  const router = useRouter();
  const pathname = usePathname();
  
  const categoryPath = TITLE_TO_PATH[label] || 'all';
  const fullPath = `/drive/${categoryPath}`;
  
  // Check if active
  const isActive = pathname.includes(categoryPath);

  // Define dynamic colors based on theme
  // Light mode uses the classic Google Blue (#e8f0fe)
  // Dark mode uses a subtle transparent white/blue tint
  const activeBackgroundColor = isDarkMode ? 'rgba(199, 208, 224, 0.15)' : '#e8f0fe';

  const handlePress = () => {
    router.push(fullPath);
    if (onPress) onPress();
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        // Dynamic Active Background
        isActive && { backgroundColor: activeBackgroundColor },
        // Dynamic Pressed/Hover Background
        pressed && { backgroundColor: theme.bgHover }
      ]}
    >
      <Ionicons 
        name={ICON_MAP[label] || 'folder-outline'} 
        size={22} 
        // Dynamic Icon Color: Brand Blue if active, Secondary Gray if not
        color={isActive ? theme.brandBlue : theme.textSecondary} 
        style={styles.icon}
      />
      <Text 
        style={[
          styles.text, 
          // Dynamic Text Color
          { color: isActive ? theme.brandBlue : theme.textMain, fontWeight: isActive ? '600' : '500' }
        ]}
      >
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
    marginRight: 8, 
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  icon: {
    marginRight: 16,
  },
  text: {
    fontSize: 14,
    // Color and Weight are handled inline for dynamic theming
  }
});