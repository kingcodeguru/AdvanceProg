import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native'; // Removed useColorScheme
import Navbar from './Navbar';
import Sidebar from './Sidebar/Sidebar';
import FileDisplay from './FileDisplay'; 
import Themes from '../styles/themes';

// 1. Import your custom Theme Hook
import { useTheme } from '../utilities/ThemeContext';

export default function DriveScreen({ category, folderId, searchQuery }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // 2. Use the hook to get the current mode
  const { isDarkMode } = useTheme();
  
  // 3. Select the correct theme object
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  return (
    // theme.bgMain = Light Blue (Light Mode) or Dark Gray (Dark Mode)
    <View style={[styles.container, { backgroundColor: theme.bgMain }]}>
      
      {/* 1. Navbar */}
      <Navbar onMenuPress={() => setSidebarVisible(true)} />

      {/* 2. Sidebar (Modal) */}
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />

      {/* 3. FileDisplay (Card) */}
      {/* theme.bgPrimary = White (Light Mode) or Darker Gray (Dark Mode) */}
      <View style={[styles.card, { backgroundColor: theme.bgPrimary }]}>
        <FileDisplay 
            category={category} 
            folderId={folderId} 
            searchQuery={searchQuery} 
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    overflow: 'hidden',
    // Shadows
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  }
});