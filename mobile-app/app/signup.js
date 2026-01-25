import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Image, 
  StyleSheet, 
  Platform, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as api from '../utilities/api'; 

// Import default image
const defaultPfpSource = require('../assets/def_pfp.jpg');

const THEME = {
  bgMain: '#ffffff',
  bgForm: '#f9f9f9',
  bgHover: '#f1f3f4',
  textMain: '#202124',
  textSecondary: '#5f6368',
  borderSubtle: '#dadce0',
  brandBlue: '#1a73e8',
  errorBg: 'rgba(217, 48, 37, 0.1)',
  errorText: '#d93025',
};

export default function SignUp() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stores the URI to display
  const [avatarUri, setAvatarUri] = useState(null);
  // Stores the Base64 string to send to backend
  const [avatarBase64, setAvatarBase64] = useState(null);

  // 1. Pick Image Function
  const pickImage = async () => {
    // Clear previous errors
    setError('');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Request base64 directly from the picker
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      // Prefix is usually needed for web/data URI compatibility
      setAvatarBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // 2. Helper to get Default Image as Base64
  const getDefaultBase64 = async () => {
    try {
      // Load the asset
      const asset = Asset.fromModule(defaultPfpSource);
      await asset.downloadAsync(); // Ensure it's available in cache
      
      // Read the file as Base64
      const base64 = await FileSystem.readAsStringAsync(asset.localUri || asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return `data:image/jpeg;base64,${base64}`;
    } catch (err) {
      console.error("Failed to load default asset", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Determine final avatar
      let finalAvatar = avatarBase64;
      
      if (!finalAvatar) {
        finalAvatar = await getDefaultBase64();
      }

      // Create User
      const signupResponse = await api.postUser({ 
        name, 
        email, 
        password, 
        avatar: finalAvatar 
      });

      if (signupResponse.status === 204) {
        // Auto-login after signup
        const response = await api.postTokens(email, password);
        if (response.status === 201) {
          const data = await response.json();
          if (data.token) {
            await AsyncStorage.setItem('userToken', data.token);
            router.replace('/drive/all');
          }
        }
      } else {
        const signupError = await signupResponse.json().catch(() => ({}));
        setError(signupError.error || 'Error creating user');
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.signupContainer}>
        <Text style={styles.signupTitle}>Create Account</Text>
        
        <View style={styles.signupForm}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.previewCircle}>
              <Image 
                source={avatarUri ? { uri: avatarUri } : defaultPfpSource} 
                style={[
                  styles.avatarPreviewImg, 
                  !avatarUri && styles.defaultOpac // Apply opacity if using default
                ]} 
              />
            </View>
            <Pressable onPress={pickImage}>
              <Text style={styles.uploadLabelBtn}>
                {avatarUri ? "Change Picture" : "Add Profile Picture"}
              </Text>
            </Pressable>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          ) : null}

          {/* Inputs */}
          <TextInput
            style={styles.signupInput}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.signupInput}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.signupInput}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.signupInput, 
              error === "Passwords do not match!" && styles.inputError
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Submit Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.signupSubmitBtn,
              pressed && { filter: 'brightness(1.1)', opacity: 0.9 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupSubmitBtnText}>Register</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.signupFooter}>
          <Text style={{ color: THEME.textSecondary }}>
            Already have an account? 
          </Text>
          <Link href="/login" style={styles.signinLink}>
            Sign In
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: THEME.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignSelf: 'center',
  },
  signupTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: THEME.textMain,
    marginBottom: 24,
    textAlign: 'center',
  },
  signupForm: {
    gap: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    borderRadius: 12,
    backgroundColor: THEME.bgForm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }
    }),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  previewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.bgHover,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewImg: {
    width: '100%',
    height: '100%',
  },
  defaultOpac: {
    opacity: 0.6,
  },
  uploadLabelBtn: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
    color: THEME.brandBlue,
  },
  signupInput: {
    width: '100%',
    padding: 12,
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
  signupSubmitBtn: {
    marginTop: 8,
    padding: 12,
    backgroundColor: THEME.brandBlue,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupSubmitBtnText: {
    color: '#fff',
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
  signupFooter: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  signinLink: {
    color: THEME.brandBlue,
    fontWeight: '600',
  },
});