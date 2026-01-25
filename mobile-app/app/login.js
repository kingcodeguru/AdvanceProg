import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../utilities/api'; // Ensure this path matches your project structure

// 1. Theme Configuration (Matching your CSS variables)
const THEME = {
  bgMain: '#ffffff',        // var(--bg-main)
  bgForm: '#f9f9f9',        // var(--bg-form)
  textMain: '#202124',      // var(--text-main)
  borderSubtle: '#dadce0',  // var(--border-subtle)
  brandBlue: '#1a73e8',     // var(--brand-blue)
  errorBg: 'rgba(217, 48, 37, 0.1)',
  errorText: '#d93025',
};

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // NOTE: Ensure your api.postTokens handles the fetch request correctly
      const response = await api.postTokens(email, password);

      // Handle the response
      // In RN, we usually check response.status if using fetch directly
      if (response.status === 201) {
        const data = await response.json();
        const token = data.token;

        if (token) {
          // Replacement for localStorage.setItem
          await AsyncStorage.setItem('userToken', token);
          
          // Navigate to /drive/all
          router.replace('/drive/all');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error("Cannot connect to the web server:", err);
      console.error(err);
      setError("Cannot connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.loginPage}>
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Sign in</Text>

        {/* Form Container */}
        <View style={styles.loginForm}>
          
          {/* Error Message */}
          {error ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <TextInput
            style={[styles.loginInput, error ? styles.inputError : null]}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={[styles.loginInput, error ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Submit Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.loginSubmitBtn,
              pressed && { opacity: 0.9 } // Hover/Active effect mimic
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginSubmitBtnText}>Next</Text>
            )}
          </Pressable>

          {/* Footer / Create Account */}
          <View style={styles.loginFooter}>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.secondaryBtn}>Create account</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </View>
  );
}

// 2. Styles (Matching your LogIn.css)
const styles = StyleSheet.create({
  loginPage: {
    flex: 1,
    backgroundColor: THEME.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400, // Matches CSS max-width
    padding: 20,
    alignSelf: 'center', // Essential for web centering
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: THEME.textMain,
    marginBottom: 24,
    textAlign: 'center',
    // letterSpacing is limited in RN, but usually fine
  },
  loginForm: {
    gap: 16, // Flex gap works in modern RN
    padding: 32,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 12,
    backgroundColor: THEME.bgForm,
    // Box Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  loginInput: {
    width: '100%',
    padding: 12, // padding: 12px 16px roughly
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 8,
    backgroundColor: THEME.bgForm,
    color: THEME.textMain,
    fontSize: 15,
  },
  inputError: {
    borderColor: THEME.errorText,
  },
  loginSubmitBtn: {
    width: '100%',
    padding: 12,
    backgroundColor: THEME.brandBlue,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSubmitBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorMessageContainer: {
    backgroundColor: THEME.errorBg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 48, 37, 0.2)',
    marginBottom: 8,
  },
  errorMessageText: {
    color: THEME.errorText,
    fontSize: 14,
    textAlign: 'center',
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  secondaryBtn: {
    color: THEME.brandBlue,
    fontWeight: '600',
    fontSize: 14,
  },
});