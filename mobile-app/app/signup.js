import React, { useState } from 'react';
import styles from '../styles/signup.styles';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Image, 
  StyleSheet, 
  Platform, 
  ActivityIndicator, 
  ScrollView,
  useColorScheme
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as api from '../utilities/api'; 
import Themes from '../styles/themes'; // <--- 2. Import Themes

const defaultPfpSource = require('../assets/def_pfp.jpg');

export default function SignUp() {
  const router = useRouter();
  
  // 3. Detect Theme
  const colorScheme = useColorScheme();
  const theme = Themes[colorScheme ?? 'light'];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);

  const pickImage = async () => {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const getDefaultBase64 = async () => {
    try {
      const asset = Asset.fromModule(defaultPfpSource);
      await asset.downloadAsync();
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
      let finalAvatar = avatarBase64;
      if (!finalAvatar) {
        finalAvatar = await getDefaultBase64();
      }

      const signupResponse = await api.postUser({ 
        name, 
        email, 
        password, 
        avatar: finalAvatar 
      });

      if (signupResponse.status === 204) {
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
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.bgMain }]}>
      <View style={styles.signupContainer}>
        <Text style={[styles.signupTitle, { color: theme.textMain }]}>Create Account</Text>
        
        <View style={[styles.signupForm, { backgroundColor: theme.bgForm, borderColor: theme.borderSubtle }]}>
          
          <View style={styles.avatarSection}>
            <View style={[styles.previewCircle, { backgroundColor: theme.bgHover, borderColor: theme.borderSubtle }]}>
              <Image 
                source={avatarUri ? { uri: avatarUri } : defaultPfpSource} 
                style={[
                  styles.avatarPreviewImg, 
                  !avatarUri && styles.defaultOpac 
                ]} 
              />
            </View>
            <Pressable onPress={pickImage}>
              <Text style={[styles.uploadLabelBtn, { color: theme.brandBlue }]}>
                {avatarUri ? "Change Picture" : "Add Profile Picture"}
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={[styles.signupInput, { color: theme.textMain, borderColor: theme.borderSubtle, backgroundColor: theme.bgForm }]}
            placeholder="Full Name"
            placeholderTextColor={theme.inputPlaceholder}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.signupInput, { color: theme.textMain, borderColor: theme.borderSubtle, backgroundColor: theme.bgForm }]}
            placeholder="Email"
            placeholderTextColor={theme.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.signupInput, { color: theme.textMain, borderColor: theme.borderSubtle, backgroundColor: theme.bgForm }]}
            placeholder="Password"
            placeholderTextColor={theme.inputPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={[
              styles.signupInput, 
              { color: theme.textMain, borderColor: theme.borderSubtle, backgroundColor: theme.bgForm },
              error === "Passwords do not match!" && styles.inputError
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.inputPlaceholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable 
            style={({ pressed }) => [
              styles.signupSubmitBtn,
              { backgroundColor: theme.brandBlue },
              pressed && { opacity: 0.9 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.bgForm} />
            ) : (
              <Text style={[styles.signupSubmitBtnText, { color: colorScheme === 'dark' ? '#202124' : '#ffffff' }]}>
                Register
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.signupFooter}>
          <Text style={{ color: theme.textSecondary }}>
            Already have an account? 
          </Text>
          <Link href="/login" style={[styles.signinLink, { color: theme.brandBlue }]}>
            Sign In
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}