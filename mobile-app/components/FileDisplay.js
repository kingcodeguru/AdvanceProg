import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Themes from '../styles/themes';
import { useRefresh } from '../context/RefreshContext';

export default function FileDisplay({ category }) {
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];
  const { refreshSignal } = useRefresh();

  useEffect(() => {
    console.log(`Fetching ${category} files... (Signal: ${refreshSignal})`);
    // Here you will call api.getFiles(category)
  }, [category, refreshSignal]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.text, { color: theme.textMain }]}>
        Displaying: {category}
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
        Refresh Signal: {String(refreshSignal)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
});