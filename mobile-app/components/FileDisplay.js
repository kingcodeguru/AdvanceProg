import React, { useEffect, useState } from 'react'; // Added useState
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Themes from '../styles/themes';
import { useRefresh } from '../context/RefreshContext';
import Navbar from './Navbar'; // No braces
import Sidebar from './Sidebar/Sidebar'; // <--- Import Sidebar

export default function FileDisplay({ category }) {
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];
  const { refreshSignal } = useRefresh();
  
  // --- Sidebar State ---
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    // console.log(`Fetching ${category} files... (Signal: ${refreshSignal})`);
    // logic...
  }, [category, refreshSignal]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      
      {/* Pass function to open sidebar */}
      <Navbar onMenuPress={() => setSidebarVisible(true)} />
      
      {/* Render Sidebar: It is absolutely positioned/modal so it sits on top */}
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />

      <View style={styles.content}>
          <Text style={[styles.text, { color: theme.textMain }]}>
            Displaying: {category}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Refresh Signal: {String(refreshSignal)}
          </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
});