import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  // Immediately redirects to the login route
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  link: {
    color: '#007AFF',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
});