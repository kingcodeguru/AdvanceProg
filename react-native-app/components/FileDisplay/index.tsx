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
  const [pageName, setPageName] = useState("Unknown"); // בדיוק כמו בווב
  const [parentId, setParentId] = useState<string | null>(null);
  
  // שמירה זמנית בזיכרון של הקומפוננטה (כל עוד היא קיימת)
  const [isLineView, setIsLineView] = useState(true);

  // --- עזרים (בדיוק כמו בווב) ---
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
        // בדומה ל-alert('something went wrong') בווב
        Alert.alert('Error', 'Something went wrong');
        router.replace('/' as any);
        return;
      }

      // טיפול בתגובות השרת (בדיוק לפי הלוגיקה של הווב)
      if (response && (response.ok || response.status === 200)) {
        const data = response.json ? await response.json() : response;
        
        if (folderId) {
          setFiles(data.sub_filedirs || []);
          setPageName(data.name);
          setParentId(data.parent_id);
        } else {
          setFiles(Array.isArray(data) ? data : []);
        }
      } else if (response.status === 401) {
        // בדומה ל-localStorage.clear()
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
      // אם יש שגיאת תקשורת חמורה, משאירים את ה-Unknown
      setPageName("Unknown");
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, folderId]);

  // רענון בשינוי פרמטרים
  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData, refreshSignal]);

  const handleBack = () => {
    if (parentId) {
      router.push(`/drive/directories/${parentId}` as any);
    } else {
      router.push('/drive/my-drive' as any);
    }
  };

  const viewMode = isLineView ? 'line' : 'box';

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {folderId && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={26} color="#5f6368" />
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>{pageName}</Text>
        </View>

        {/* View Switcher (שמירה זמנית ב-State) */}
        <View style={styles.viewSwitcher}>
          <TouchableOpacity 
            style={[styles.switchBtn, isLineView && styles.switchBtnActive]} 
            onPress={() => setIsLineView(true)}
          >
             <MaterialIcons 
                name="format-list-bulleted" 
                size={24} 
                color={isLineView ? "#1a73e8" : "#5f6368"} 
             />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.switchBtn, !isLineView && styles.switchBtnActive]} 
            onPress={() => setIsLineView(false)}
          >
             <MaterialIcons 
                name="grid-view" 
                size={24} 
                color={!isLineView ? "#1a73e8" : "#5f6368"} 
             />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Content --- */}
      {loading ? (
        <View style={styles.centerContainer}>
          {/* מציג גלגל טעינה וטקסט בדיוק כמו בווב */}
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