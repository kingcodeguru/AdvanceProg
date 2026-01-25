import React, { useState } from 'react';
import styles from '../styles/login.styles';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Platform, 
  ActivityIndicator,
  useColorScheme // <--- 1. Import Hook
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../utilities/api'; 
import Themes from '../styles/themes'; // <--- 2. Import Themes

export default function LogIn() {
  const router = useRouter();
  
  // 3. Detect Theme
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.postTokens(email, password);

      if (response.status === 201) {
        const data = await response.json();
        const token = data.token;

        if (token) {
          await AsyncStorage.setItem('userToken', token);
          router.replace('/drive/all');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error("Cannot connect to the web server:", err);
      setError("Cannot connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Styles are overridden inline using the 'theme' object
  return (
    <View style={[styles.loginPage, { backgroundColor: theme.bgMain }]}>
      <View style={styles.loginContainer}>
        <Text style={[styles.loginTitle, { color: theme.textMain }]}>Sign in</Text>

        <View style={[styles.loginForm, { backgroundColor: theme.bgForm, borderColor: theme.borderSubtle }]}>
          
          {error ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={[
              styles.loginInput, 
              { 
                color: theme.textMain, 
                borderColor: theme.borderSubtle,
                backgroundColor: theme.bgForm 
              }, 
              error ? styles.inputError : null
            ]}
            placeholder="Email"
            placeholderTextColor={theme.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.loginInput, 
              { 
                color: theme.textMain, 
                borderColor: theme.borderSubtle,
                backgroundColor: theme.bgForm 
              },
              error ? styles.inputError : null
            ]}
            placeholder="Password"
            placeholderTextColor={theme.inputPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable 
            style={({ pressed }) => [
              styles.loginSubmitBtn,
              { backgroundColor: theme.brandBlue },
              pressed && { opacity: 0.9 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.bgForm} /> 
            ) : (
              // Use bgForm text color for button if brandBlue is light (dark mode), 
              // or white if brandBlue is dark. For simplicity, we stick to logic or hardcode white:
              <Text style={[styles.loginSubmitBtnText, { color: colorScheme === 'dark' ? '#202124' : '#ffffff' }]}>
                Next
              </Text>
            )}
          </Pressable>

          <View style={styles.loginFooter}>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={[styles.secondaryBtn, { color: theme.brandBlue }]}>Create account</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </View>
  );
}
