import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, 
  Alert, Modal, Animated, Image, NativeSyntheticEvent, NativeScrollEvent 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { styles } from './styles';
import ListFileItems from './ListFileItems';
import * as api from '@/utilities/api'; 

// משתנה לאייקון הפלוס - תוכלי לעדכן את הנתיב כאן
const PLUS_ICON = require('@/assets/images/plus_button.svg'); 

const FileDisplay = ({ refreshSignal: externalRefresh }: { refreshSignal?: any }) => {
  const { category, searchQuery, folderId } = useLocalSearchParams();
  const router = useRouter();

  // --- States ---
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageName, setPageName] = useState("Unknown");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLineView, setIsLineView] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(false);

  // אנימציה לכפתור הצף (FAB)
  const fabOpacity = useRef(new Animated.Value(1)).current;

  // --- לוגיקת API (מועתקת מה-Web) ---
  const sendToFileAPI = async (payload: any) => {
    try {
      const response = await api.postFiledir(payload);
      if (response && response.ok) return true;
    } catch (err) {
      console.error("API Error:", err);
    }
    return null;
  };

  const handleCreateFolder = () => {
    setIsMenuOpen(false);
    // Alert.prompt עובד ב-iOS. באנדרואיד מומלץ להשתמש בתיבת טקסט מותאמת אישית בעתיד.
    Alert.prompt("תיקייה חדשה", "הזן שם לתיקייה:", async (name) => {
      if (!name) return;
      await sendToFileAPI({ name, is_file: false, parent_id: folderId || null });
      setRefreshSignal(prev => !prev);
    }, 'plain-text');
  };

  const handleFileUpload = async (type: 'image' | 'file') => {
    setIsMenuOpen(false);
    try {
      if (type === 'image') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          // חילוץ שם קובץ מתוך ה-URI במידה ואין name
          const fileName = asset.uri.split('/').pop() || "upload_image.jpg";
          
          await sendToFileAPI({ 
            name: fileName, 
            is_file: true, 
            content: asset.uri, 
            parent_id: folderId || null, 
            type: 'image' 
          });
          setRefreshSignal(prev => !prev);
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          await sendToFileAPI({ 
            name: asset.name, // ב-DocumentPicker קיים name
            is_file: true, 
            content: asset.uri, 
            parent_id: folderId || null, 
            type: 'text' 
          });
          setRefreshSignal(prev => !prev);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // --- פונקציית הסתרת הכפתור בגלילה ---
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // אם גוללים למטה יותר מ-20 פיקסלים, הכפתור נעלם
    Animated.timing(fabOpacity, {
      toValue: offsetY > 20 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      let response: any;
      if (searchQuery) {
        response = await api.getFilesBySearch(searchQuery as string);
        setPageName(""); // בחיפוש אין כותרת
      } else if (category) {
        response = await api.getFilesByCategory(category as string);
        // פונקציית עזר לשם הקטגוריה
        const names: any = { all: 'Home', 'my-drive': 'My Drive', 'recent': 'Recent', 'starred': 'Starred', 'bin': 'Trash' };
        setPageName(names[category as string] || 'Home');
      } else if (folderId) {
        response = await api.getFileById(folderId as string);
      } else {
        response = await api.getFilesByCategory('all');
        setPageName("Home");
      }

      if (response && response.ok) {
        const data = await response.json();
        if (folderId) {
          setFiles(data.sub_filedirs || []);
          setPageName(data.name);
          setParentId(data.parent_id);
        } else {
          setFiles(Array.isArray(data) ? data : []);
        }
      }
    } catch (e) {
      console.error(e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, folderId, refreshSignal, externalRefresh]);

  useEffect(() => { fetchWorkspaceData(); }, [fetchWorkspaceData]);

  const viewMode = isLineView ? 'line' : 'box';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {!searchQuery && (
            <>
              {folderId && (
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={26} color="#5f6368" />
                </TouchableOpacity>
              )}
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{pageName}</Text>
            </>
          )}
        </View>
        <View style={styles.viewSwitcher}>
            <TouchableOpacity onPress={() => setIsLineView(true)} style={[styles.switchBtn, isLineView && styles.switchBtnActive]}>
                <MaterialIcons name="format-list-bulleted" size={28} color={isLineView ? "#1a73e8" : "#5f6368"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLineView(false)} style={[styles.switchBtn, !isLineView && styles.switchBtnActive]}>
                <MaterialIcons name="grid-view" size={28} color={!isLineView ? "#1a73e8" : "#5f6368"} />
            </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1a73e8" /></View>
      ) : (
        <View style={{ flex: 1 }}>
          <ListFileItems 
            files={files} 
            viewMode={viewMode} 
            onRefresh={fetchWorkspaceData}
            onScroll={handleScroll} // העברת פונקציית הגלילה
          />

          {!searchQuery && (
            <Animated.View style={[styles.fab, { opacity: fabOpacity }]}>
              <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
                <Image source={PLUS_ICON} style={styles.fabIcon} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}

      {/* תפריט "חדש" (Modal) */}
      <Modal visible={isMenuOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <MenuOption label="העלאת קובץ" icon="upload" onPress={() => handleFileUpload('file')} />
            <MenuOption label="צילום תמונה" icon="camera-alt" onPress={() => {}} />
            <MenuOption label="יצירת תיקייה" icon="create-new-folder" onPress={handleCreateFolder} />
            <View style={styles.menuDivider} />
            <MenuOption label="Google Docs" icon="description" color="#4285F4" onPress={() => {}} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// קומפוננטת עזר לאופציות בתפריט
const MenuOption = ({ label, icon, onPress, color = "#5f6368" }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

export default FileDisplay;