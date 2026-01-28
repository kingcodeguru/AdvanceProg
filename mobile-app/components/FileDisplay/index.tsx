import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, 
  Alert, Modal, Animated, Image, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, 
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { styles } from './styles';
import ListFileItems from './ListFileItems';
import * as api from '@/utilities/api'; 

// 1. Import Theme Hook and Data
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

const PLUS_ICON = require('@/assets/images/plus_google.png'); 

const FileDisplay = ({ refreshSignal: externalRefresh, category, searchQuery, folderId }: { refreshSignal?: any, category?: string, searchQuery?: string, folderId?: string }) => {
  const router = useRouter();

  // 2. Get Current Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageName, setPageName] = useState("Home");
  const [isLineView, setIsLineView] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshInternal, setRefreshInternal] = useState(false);

  const fabOpacity = useRef(new Animated.Value(1)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;
  const isFabHidden = useRef(false); 

  const triggerRefresh = () => setRefreshInternal(prev => !prev);

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

  const createTextFile = () => {
    closeMenu();
    Alert.prompt("Enter text file name:", "", async (name) => {
      if (!name) return;
      const newFile = await sendToFileAPI({ 
        name, is_file: true, content: "", parent_id: folderId || null, type: "text" 
      });
      if (newFile && typeof newFile === 'object' && newFile.id) {
        router.push(`/drive/files/${newFile.id}` as any);
      } else triggerRefresh();
    });
  };

  const createFolder = () => {
    closeMenu();
    Alert.prompt("Enter folder name:", "", async (name) => {
      if (!name) return;
      await sendToFileAPI({ name, is_file: false, parent_id: folderId || null });
      triggerRefresh();
    });
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
        triggerRefresh();
      }
    } catch (err) { 
        console.log("Upload Error:", err);
    }
  };

  // --- Menu Animation ---
  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(overlayFade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(overlayFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => setIsMenuOpen(false));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldHide = offsetY > 10;

    if (shouldHide !== isFabHidden.current) {
      isFabHidden.current = shouldHide;
      Animated.timing(fabOpacity, {
        toValue: shouldHide ? 0 : 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  };

  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      let response: any;
      if (searchQuery) response = await api.getFilesBySearch(searchQuery as string);
      else if (category) response = await api.getFilesByCategory(category as string);
      else if (folderId) response = await api.getFileById(folderId as string);
      else response = await api.getFilesByCategory('all');

      if (response?.ok) {
        const data = await response.json();
        
        // --- 3. SAFETY CRASH FIX: Ensure Array ---
        let safeFiles: any[] = [];
        if (folderId) {
            safeFiles = Array.isArray(data.sub_filedirs) ? data.sub_filedirs : [];
            setPageName(data.name || "Folder");
        } else {
            if (Array.isArray(data)) safeFiles = data;
            else if (data && Array.isArray(data.files)) safeFiles = data.files;
            else safeFiles = [];

            if (category) {
                const names: any = { all: 'Home', 'my-drive': 'My Drive', recent: 'Recent', starred: 'Starred', bin: 'Trash', 'shared-with-me': 'Shared with Me' };
                setPageName(names[category as string] || 'Home');
            } else if (searchQuery) {
                setPageName(`Search "${searchQuery}"`);
            }
        }
        setFiles(safeFiles);
      }
    } catch (e) { setFiles([]); } finally { setLoading(false); }
  }, [category, searchQuery, folderId, refreshInternal, externalRefresh]);

  useEffect(() => { fetchWorkspaceData(); }, [fetchWorkspaceData]);

  return (
    // 4. Dynamic Background
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {!searchQuery && (
            <>
              {folderId && (
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
              {/* Dynamic Title Color */}
              <Text style={[styles.title, { color: theme.textMain }]} numberOfLines={1} ellipsizeMode="tail">
                {pageName}
              </Text>
            </>
          )}
        </View>
        <View style={[styles.viewSwitcher, { backgroundColor: theme.bgForm }]}>
          {/* Switcher Buttons: Brand Blue if active, Secondary Text if inactive */}
          <TouchableOpacity onPress={() => setIsLineView(true)} style={[styles.switchBtn, isLineView && styles.switchBtnActive, { backgroundColor: isLineView ? theme.bgMain : 'transparent' }]}>
            <MaterialIcons name="format-list-bulleted" size={26} color={isLineView ? theme.brandBlue : theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLineView(false)} style={[styles.switchBtn, !isLineView && styles.switchBtnActive, { backgroundColor: !isLineView ? theme.bgMain : 'transparent' }]}>
            <MaterialIcons name="grid-view" size={26} color={!isLineView ? theme.brandBlue : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.brandBlue} /></View>
        ) : (
          <ListFileItems 
            files={files || []} 
            viewMode={isLineView ? 'line' : 'box'} 
            onRefresh={fetchWorkspaceData} 
            onScroll={handleScroll} 
          />
        )}
        
        {/* FAB (Plus Button) */}
        {!searchQuery && (
          <Animated.View style={[styles.fab, { opacity: fabOpacity, transform: [{ scale: fabOpacity }] }]}>
            <TouchableOpacity onPress={openMenu}>
                <Image source={PLUS_ICON} style={styles.fabIcon} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Modal Menu */}
      <Modal visible={isMenuOpen} transparent animationType="slide" onRequestClose={closeMenu}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.modalOverlay, { opacity: overlayFade }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>
          
          {/* Dynamic Modal Content Background */}
          <View style={[styles.modalContent, { backgroundColor: theme.bgForm }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.borderSubtle }]} />
            
            <MenuOption 
                label="New folder" 
                icon="create-new-folder" 
                onPress={createFolder} 
                color={theme.textSecondary} 
                textColor={theme.textMain} 
            />
            <MenuOption 
                label="New text file" 
                icon="note-add" 
                onPress={createTextFile} 
                color={theme.textSecondary} 
                textColor={theme.textMain}
            />
            
            <View style={[styles.menuDivider, { backgroundColor: theme.borderSubtle }]} />
            
            <MenuOption 
                label="File upload" 
                icon="upload-file" 
                onPress={() => handleUpload('upload-text')} 
                color={theme.textSecondary} 
                textColor={theme.textMain}
            />
            <MenuOption 
                label="Image upload" 
                icon="image" 
                onPress={() => handleUpload('upload-image')} 
                color={theme.textSecondary} 
                textColor={theme.textMain}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 5. Updated Helper Component to accept dynamic colors
const MenuOption = ({ label, icon, onPress, color = "#5f6368", textColor = "#333" }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.menuText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

export default FileDisplay;