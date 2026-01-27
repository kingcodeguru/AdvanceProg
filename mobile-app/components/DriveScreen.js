import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Navbar from './Navbar';
import Sidebar from './Sidebar/Sidebar';
import FileDisplay from './FileDisplay'; // Points to index.tsx
import Themes from '../styles/themes';

export default function DriveScreen({ category, folderId, searchQuery }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.bgMain }]}>
      
      {/* 1. Navbar (Full Width) */}
      <Navbar onMenuPress={() => setSidebarVisible(true)} />

      {/* 2. Sidebar (Modal) */}
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />

      {/* 3. FileDisplay (Inside the "Card" Look) */}
      <View style={[styles.card, { backgroundColor: theme.bgPrimary }]}>
        <FileDisplay category={category} folderId={folderId} searchQuery={searchQuery} />
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
    // We moved the card styling FROM _layout.js TO here
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