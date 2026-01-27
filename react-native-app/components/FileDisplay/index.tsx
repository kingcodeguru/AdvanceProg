import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';
import ListFileItems from './ListFileItems';
import * as api from '@/utilities/api'; 

interface FileDisplayProps {
  refreshSignal?: number | boolean;
}

const FileDisplay = ({ refreshSignal }: FileDisplayProps) => {
  const { category, searchQuery, folderId } = useLocalSearchParams();
  const router = useRouter();

  // --- State ---
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageName, setPageName] = useState("Unknown");
  const [parentId, setParentId] = useState<string | null>(null);
  
  // שמירה זמנית של מצב התצוגה (כל עוד האפליקציה פתוחה)
  const [isLineView, setIsLineView] = useState(true);

  // עזר לתרגום קטגוריות לשמות תצוגה
  const categoryToName = (cat: string) => {
    switch (cat) {
      case 'all': return 'Home';
      case 'my-drive': return 'My Drive';
      case 'shared-with-me': return 'Shared with me';
      case 'recent': return 'Recent';
      case 'starred': return 'Starred';
      case 'bin': return 'Trash';
      default: return 'Home';
    }
  };

  // --- לוגיקה ראשית: fetchWorkspaceData ---
  const fetchWorkspaceData = useCallback(async () => {
    setLoading(true);

    let response: any;
    try {
      if (searchQuery) {
        response = await api.getFilesBySearch(searchQuery as string);
        setPageName(`Search results for "${searchQuery}"`);
      } else if (category) {
        response = await api.getFilesByCategory(category as string);
        setPageName(categoryToName(category as string));
      } else if (folderId) {
        response = await api.getFileById(folderId as string);
      } else {
        // ברירת מחדל במידה ואין פרמטרים - טעינת דף הבית
        response = await api.getFilesByCategory('all');
        setPageName(categoryToName('all'));
      }

      // טיפול בתגובות השרת לפי הלוגיקה של הווב
      if (response && (response.ok || response.status === 200)) {
        const data = response.json ? await response.json() : response;
        
        if (folderId) {
          setFiles(data.sub_filedirs || []);
          setPageName(data.name || 'Folder');
          setParentId(data.parent_id);
        } else {
          setFiles(Array.isArray(data) ? data : []);
          // אם אנחנו בקטגוריה, נוודא שהשם מעודכן
          if (category) setPageName(categoryToName(category as string));
        }
      } else if (response.status === 401) {
        // בדומה ל-localStorage.clear() וניווט להתחלה
        router.replace('/' as any);
      } else if (response.status === 403) {
        Alert.alert('Permission', "You don't have permission to access this folder.");
        router.replace('/drive/all' as any);
      } else {
        const data = response.json ? await response.json() : response;
        Alert.alert('Error', `${data?.error || 'Unknown error'}`);
        router.replace('/drive/all' as any);
      }
    } catch (error) {
      console.error("Workspace fetch error:", error);
      setPageName("Unknown");
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, folderId]);

  // רענון בשינוי פרמטרים או סיגנל חיצוני
  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData, refreshSignal]);

  const handleBack = () => {
    if (parentId) {
      // ניווט לתיקיית האב
      router.push(`/drive/directories/${parentId}` as any);
    } else {
      // אם אין הורה, חזרה למיי דרייב
      router.push('/drive/my-drive' as any);
    }
  };

  const viewMode = isLineView ? 'line' : 'box';

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* בחיפוש לא מציגים כותרת או חץ אחורה (לפי הווב) */}
          {!searchQuery && (
            <>
              {folderId && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={26} color="#5f6368" />
                </TouchableOpacity>
              )}
              <Text 
                style={styles.title} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {pageName}
              </Text>
            </>
          )}
        </View>

        {/* סוויץ' החלפת תצוגה */}
        <View style={styles.viewSwitcher}>
          <TouchableOpacity 
            style={[styles.switchBtn, isLineView && styles.switchBtnActive]} 
            onPress={() => setIsLineView(true)}
          >
             <MaterialIcons 
               name="format-list-bulleted" 
               size={28} 
               color={isLineView ? "#1a73e8" : "#5f6368"} 
             />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.switchBtn, !isLineView && styles.switchBtnActive]} 
            onPress={() => setIsLineView(false)}
          >
             <MaterialIcons 
               name="grid-view" 
               size={28} 
               color={!isLineView ? "#1a73e8" : "#5f6368"} 
             />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- תוכן הקבצים --- */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={{marginTop: 10, color: '#5f6368'}}>Loading files...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
            <ListFileItems 
                files={files} 
                viewMode={viewMode} 
                onRefresh={fetchWorkspaceData}
                showFooter={!searchQuery}
            />
        </View>
      )}

    </SafeAreaView>
  );
};

export default FileDisplay;