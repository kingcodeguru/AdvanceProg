import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, Animated, Image, 
  StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { styles } from './styles';
import * as api from '@/utilities/api'; 
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

const PLUS_ICON = require('@/assets/images/plus_google.png'); 

interface PlusModalProps {
  folderId?: string;
  onRefresh: () => void;
  fabOpacity: Animated.Value;
}

const PlusModal = ({ folderId, onRefresh, fabOpacity }: PlusModalProps) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  // --- State ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const overlayFade = useRef(new Animated.Value(0)).current;

  // Input Modal State
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [createType, setCreateType] = useState<'folder' | 'text'>('folder');

  // --- API Helper ---
  const sendToFileAPI = async (payload: any) => {
    try {
      const response = await api.postFiledir(payload);
      if (response && response.ok) {
        const locationHeader = response.headers.get('Location');
        if (locationHeader) {
          const segments = locationHeader.split('/');
          const fid = segments.pop() || segments.pop(); 
          return { id: fid };
        }
        return true; 
      }
    } catch (err) {
      console.error("API Error:", err);
    }
    return null;
  };

  // --- Actions ---
  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(overlayFade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(overlayFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => setIsMenuOpen(false));
  };

  const initiateCreate = (type: 'folder' | 'text') => {
    closeMenu();
    setCreateType(type);
    setInputValue('');
    setInputVisible(true);
  };

  const handleCreateSubmit = async () => {
    if (!inputValue.trim()) return;
    setInputVisible(false);

    if (createType === 'text') {
        const newFile = await sendToFileAPI({ 
            name: inputValue, 
            is_file: true, 
            content: "", 
            parent_id: folderId || null, 
            type: "text" 
        });
        if (newFile && typeof newFile === 'object' && newFile.id) {
            router.push(`/drive/files/${newFile.id}` as any);
        } else {
            onRefresh();
        }
    } else {
        await sendToFileAPI({ 
            name: inputValue, 
            is_file: false, 
            parent_id: folderId || null 
        });
        onRefresh();
    }
  };

  const handleUpload = async (uploadType: 'upload-image' | 'upload-text') => {
    closeMenu();
    try {
      const result = uploadType === 'upload-image' 
        ? await ImagePicker.launchImageLibraryAsync({ base64: true })
        : await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

      if (result && !result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        let content = "";
        if (uploadType === 'upload-image') {
          content = file.base64 ? `data:image/jpeg;base64,${file.base64}` : "";
        } else {
          content = await FileSystem.readAsStringAsync(file.uri);
        }
        const fileName = (file as any).name || file.uri.split('/').pop();
        await sendToFileAPI({ 
          name: fileName, is_file: true, content, parent_id: folderId || null, 
          type: uploadType === 'upload-image' ? "image" : "text" 
        });
        onRefresh();
      }
    } catch (err) { 
        console.log("Upload Error:", err);
    }
  };

  return (
    <>
      {/* 1. The Floating Action Button (FAB) */}
      <Animated.View style={[
          styles.fab, 
          { 
            opacity: fabOpacity, 
            transform: [{ scale: fabOpacity }], 
            backgroundColor: theme.bgForm 
          }
      ]}>
        <TouchableOpacity onPress={openMenu}>
            <Image source={PLUS_ICON} style={styles.fabIcon} />
        </TouchableOpacity>
      </Animated.View>

      {/* 2. The Menu Modal (Bottom Sheet) */}
      <Modal visible={isMenuOpen} transparent animationType="slide" onRequestClose={closeMenu}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.modalOverlay, { opacity: overlayFade }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>
          
          <View style={[styles.modalContent, { backgroundColor: theme.bgForm }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.borderSubtle }]} />
            
            <MenuOption label="New folder" icon="create-new-folder" onPress={() => initiateCreate('folder')} color={theme.textSecondary} textColor={theme.textMain} />
            <MenuOption label="New text file" icon="note-add" onPress={() => initiateCreate('text')} color={theme.textSecondary} textColor={theme.textMain}/>
            
            <View style={[styles.menuDivider, { backgroundColor: theme.borderSubtle }]} />
            
            <MenuOption label="File upload" icon="upload-file" onPress={() => handleUpload('upload-text')} color={theme.textSecondary} textColor={theme.textMain}/>
            <MenuOption label="Image upload" icon="image" onPress={() => handleUpload('upload-image')} color={theme.textSecondary} textColor={theme.textMain}/>
          </View>
        </View>
      </Modal>

      {/* 3. The Input Modal (For naming files/folders) */}
      <Modal 
        visible={inputVisible} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setInputVisible(false)}
      >
        <View style={styles.inputModalOverlay}>
            <View style={[styles.inputModalContent, { backgroundColor: theme.bgForm }]}>
                <Text style={[styles.inputModalTitle, { color: theme.textMain }]}>
                    {createType === 'folder' ? "New folder" : "New text file"}
                </Text>
                
                <TextInput
                    style={[styles.inputField, { 
                        color: theme.textMain, 
                        borderColor: theme.brandBlue, 
                        backgroundColor: theme.bgPrimary 
                    }]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Enter name"
                    placeholderTextColor={theme.textSecondary}
                    autoFocus
                />

                <View style={styles.inputActions}>
                    <TouchableOpacity onPress={() => setInputVisible(false)}>
                        <Text style={[styles.inputBtn, { color: theme.brandBlue }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCreateSubmit}>
                        <Text style={[styles.inputBtn, { color: theme.brandBlue, fontWeight: 'bold' }]}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </>
  );
};

const MenuOption = ({ label, icon, onPress, color = "#5f6368", textColor = "#333" }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}><MaterialIcons name={icon} size={24} color={color} /></View>
    <Text style={[styles.menuText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

export default PlusModal;