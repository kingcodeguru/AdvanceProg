import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, 
  Animated, NativeSyntheticEvent, NativeScrollEvent 
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';
import ListFileItems from './ListFileItems';
import * as api from '@/utilities/api'; 
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

// IMPORT THE NEW COMPONENT
import PlusModal from './PlusModal';

const FileDisplay = ({ refreshSignal: externalRefresh, category, searchQuery, folderId }: { refreshSignal?: any, category?: string, searchQuery?: string, folderId?: string }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageName, setPageName] = useState("Home");
  const [isLineView, setIsLineView] = useState(true);
  const [refreshInternal, setRefreshInternal] = useState(false);

  // Animation values (Shared with PlusModal)
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const isFabHidden = useRef(false); 

  const triggerRefresh = () => setRefreshInternal(prev => !prev);

  // --- Scroll Handler (Toggles FAB visibility) ---
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldHide = offsetY > 10;
    if (shouldHide !== isFabHidden.current) {
      isFabHidden.current = shouldHide;
      Animated.timing(fabOpacity, { toValue: shouldHide ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    }
  };

  // --- Data Fetching ---
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
              <Text style={[styles.title, { color: theme.textMain }]} numberOfLines={1}>
                {pageName}
              </Text>
            </>
          )}
        </View>
        <View style={styles.viewSwitcher}>
          <TouchableOpacity onPress={() => setIsLineView(true)} style={[styles.switchBtn, isLineView && styles.switchBtnActive, { backgroundColor: isLineView ? theme.bgMain : 'transparent' }]}>
            <MaterialIcons name="format-list-bulleted" size={26} color={isLineView ? theme.brandBlue : theme.bgForm} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLineView(false)} style={[styles.switchBtn, !isLineView && styles.switchBtnActive, { backgroundColor: !isLineView ? theme.bgMain : 'transparent' }]}>
            <MaterialIcons name="grid-view" size={26} color={!isLineView ? theme.brandBlue : theme.bgForm} />
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
        
        {/* NEW: Extracted PlusModal Component */}
        {!searchQuery && (
          <PlusModal 
             folderId={folderId} 
             onRefresh={triggerRefresh} 
             fabOpacity={fabOpacity} 
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default FileDisplay;