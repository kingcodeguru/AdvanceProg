import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, 
  Alert, Modal, Animated, Image, NativeSyntheticEvent, NativeScrollEvent, StyleSheet 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { styles } from './styles';
import ListFileItems from './ListFileItems';
import * as api from '@/utilities/api'; 

const PLUS_ICON = require('@/assets/images/plus_google.png'); 

const FileDisplay = ({ refreshSignal: externalRefresh }: { refreshSignal?: any }) => {
  const { category, searchQuery, folderId } = useLocalSearchParams();
  const router = useRouter();

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageName, setPageName] = useState("Home");
  const [isLineView, setIsLineView] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshInternal, setRefreshInternal] = useState(false);

  // אנימציות - עמעום מהיר
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;

  // --- לוגיקה זהה לווב (Sidebar.js) ---
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
        console.log("Upload Error (Server might be down):", err);
    }
  };

  // --- ניהול תפריט ---
  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(overlayFade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(overlayFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => setIsMenuOpen(false));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    Animated.timing(fabOpacity, { toValue: offsetY > 10 ? 0 : 1, duration: 50, useNativeDriver: true }).start();
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
        setFiles(folderId ? data.sub_filedirs : data);
        if (folderId) setPageName(data.name);
        else if (category) {
          const names: any = { all: 'Home', 'my-drive': 'My Drive', recent: 'Recent', starred: 'Starred', bin: 'Trash' };
          setPageName(names[category as string] || 'Home');
        }
      }
    } catch (e) { setFiles([]); } finally { setLoading(false); }
  }, [category, searchQuery, folderId, refreshInternal, externalRefresh]);

  useEffect(() => { fetchWorkspaceData(); }, [fetchWorkspaceData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {!searchQuery && (
            <>
              {folderId && (
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="#5f6368" />
                </TouchableOpacity>
              )}
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{pageName}</Text>
            </>
          )}
        </View>
        <View style={styles.viewSwitcher}>
          <TouchableOpacity onPress={() => setIsLineView(true)} style={[styles.switchBtn, isLineView && styles.switchBtnActive]}>
            <MaterialIcons name="format-list-bulleted" size={26} color={isLineView ? "#1a73e8" : "#5f6368"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLineView(false)} style={[styles.switchBtn, !isLineView && styles.switchBtnActive]}>
            <MaterialIcons name="grid-view" size={26} color={!isLineView ? "#1a73e8" : "#5f6368"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1a73e8" /></View>
        ) : (
          <ListFileItems files={files} viewMode={isLineView ? 'line' : 'box'} onRefresh={fetchWorkspaceData} onScroll={handleScroll} />
        )}
        {!searchQuery && (
          <Animated.View style={[styles.fab, { opacity: fabOpacity }]}>
            <TouchableOpacity onPress={openMenu}><Image source={PLUS_ICON} style={styles.fabIcon} /></TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <Modal visible={isMenuOpen} transparent animationType="slide" onRequestClose={closeMenu}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.modalOverlay, { opacity: overlayFade }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeMenu} />
          </Animated.View>
          
          {/* תפריט עם ארבעת השדות המדויקים מהווב */}
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <MenuOption label="New folder" icon="create-new-folder" onPress={createFolder} />
            <MenuOption label="New text file" icon="note-add" onPress={createTextFile} />
            <View style={styles.menuDivider} />
            <MenuOption label="File upload" icon="upload-file" onPress={() => handleUpload('upload-text')} />
            <MenuOption label="Image upload" icon="image" onPress={() => handleUpload('upload-image')} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const MenuOption = ({ label, icon, onPress, color = "#5f6368" }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}><MaterialIcons name={icon} size={24} color={color} /></View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

export default FileDisplay;