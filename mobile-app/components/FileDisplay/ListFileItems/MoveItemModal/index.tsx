import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator, 
  SafeAreaView,
  Image,
  StyleSheet
} from 'react-native';
import { styles } from './styles'; // ודאי שיש לך את הסטיילים הבסיסיים כאן
import { 
  getFilesByDirectory, 
  patchFile, 
  getFilesBySearch, 
  getFileById, 
  getAllFiles, 
  getAllStaredFiles, // לוודא שזה קיים ב-api.js שלך
  getRole 
} from '@/utilities/api'; 
import { can_edit } from '@/utilities/roles';

// 1. Import Theme Hooks
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

// --- Images ---
const FOLDER_ICON = require('@/assets/images/dir_logo.png'); 
const BACK_ICON = require('@/assets/images/back_icon.png');
const SEARCH_ICON = require('@/assets/images/search_icon.png');
const CLOSE_ICON = require('@/assets/images/x_icon.png');
const ARROW_RIGHT = require('@/assets/images/arrow_right.png'); // ודאי שיש אייקון כזה או דומה

interface MoveFileModalProps {
  visible: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
  onMoveSuccess: () => void;
}

interface FolderItem {
  fid: string;
  name: string;
  type: string;
  parent_id?: string | null;
  starred?: boolean;
}

const MoveItemModal = ({ visible, fileId, fileName, onClose, onMoveSuccess }: MoveFileModalProps) => {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  // --- State זהה ל-Web ---
  const [isInit, setIsInit] = useState(true);
  const [originParentId, setOriginParentId] = useState<string | null>(null);
  const [originParentName, setOriginParentName] = useState('My Drive');

  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  const [currentPath, setCurrentPath] = useState<{fid: string, name: string}[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 1. Initialize (כמו ב-Web) ---
  useEffect(() => {
    if (visible && fileId) {
      let mounted = true;
      const initializeModal = async () => {
        try {
          setIsInit(true);
          const fileRes = await getFileById(fileId);
          const fileData = fileRes.json ? await fileRes.json() : fileRes;
          
          const parentId = fileData.parent_id;
          if (mounted) setOriginParentId(parentId);

          let startName = 'My Drive';
          let startId = 'root';

          if (parentId && parentId !== 'root') {
            startId = parentId;
            try {
              const parentRes = await getFileById(parentId);
              const parentData = parentRes.json ? await parentRes.json() : parentRes;
              startName = parentData.name;
            } catch (e) {
              startName = 'Unknown Location';
            }
          }
          if (mounted) setOriginParentName(startName);

          if (mounted) {
            setCurrentPath([{ fid: startId, name: startName }]);
            setIsInit(false);
          }
        } catch (err) {
          console.error("Init failed", err);
          if (mounted) {
            setCurrentPath([{ fid: 'root', name: 'My Drive' }]);
            setIsInit(false);
          }
        }
      };
      initializeModal();
      return () => { mounted = false; };
    }
  }, [visible, fileId]);

  // --- Helpers ---
  const currentFolder = currentPath.length > 0 
    ? currentPath[currentPath.length - 1] 
    : { fid: 'root', name: 'My Drive' };

  // מתי להציג את החיפוש? (לפי ה-Web: ב-Starred או כשאנחנו ברוט של All)
  const showSearchBar = activeTab === 'starred' || (activeTab === 'all' && currentPath.length === 1);

  // --- 2. Load Folders Logic (הליבה של ה-Web) ---
  const loadFolders = useCallback(async () => {
    if (isInit || !visible) return;

    setIsLoadingFolders(true);
    try {
      let response;
      let isSearch = false;
      const targetId = currentFolder.fid || 'root';

      // בחירת מקור המידע לפי המצב
      if (searchQuery.length > 0 && showSearchBar) {
        response = await getFilesBySearch(searchQuery);
        isSearch = true;
      } else if (activeTab === 'starred') {
        response = await getAllStaredFiles();
      } else if (targetId === 'root') {
        response = await getAllFiles();
      } else {
        response = await getFilesByDirectory(targetId);
      }

      if (response && (response.ok || Array.isArray(response))) {
        let data = response.json ? await response.json() : response;

        if (!Array.isArray(data)) {
          data = (data && typeof data === 'object') ? [data] : [];
        }

        // נירמול הנתונים
        data = data.map((item: any) => ({
          ...item,
          fid: item.fid || item.id,
          name: item.name || 'Untitled'
        }));

        // סינונים ראשוניים
        if (!isSearch && targetId === 'root' && activeTab === 'all') {
          // ב-Root מציגים רק דברים שאין להם אבא (או שאבא שלהם הוא root)
          data = data.filter((item: any) => !item.parent_id || item.parent_id === 'root');
        }
        if (isSearch && activeTab === 'starred') {
          data = data.filter((item: any) => item.starred === true);
        }

        // סינון לוגי: רק תיקיות, לא הקובץ עצמו, לא האבא הנוכחי
        const candidates = data.filter((item: any) => 
          (item.type === 'directory' || item.type === 'dir' || item.type === 'folder') && 
          item.fid !== fileId && 
          item.fid !== originParentId &&
          item.fid !== currentFolder.fid
        );

        // בדיקת הרשאות (Async Filter)
        const allowedFolders: FolderItem[] = [];
        
        // אופציה להזיז ל-My Drive אם אנחנו לא שם
        if (originParentId !== null && originParentId !== 'root' && !isSearch && currentPath.length === 1 && activeTab === 'all') {
             // הערה: ב-RN אנחנו מוסיפים את זה ידנית לרשימה אם צריך
             // allowedFolders.push({ fid: 'root', name: 'My Drive', type: 'directory' });
        }

        for (const folder of candidates) {
          try {
            const role = await getRole(folder.fid);
            if (can_edit(role)) {
              allowedFolders.push(folder);
            }
          } catch (e) { console.log(e); }
        }

        setFolders(allowedFolders);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      setFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  }, [isInit, visible, searchQuery, activeTab, currentFolder.fid, fileId, originParentId, showSearchBar]);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  // איפוס חיפוש במעבר טאבים
  useEffect(() => { setSearchQuery(''); }, [activeTab, currentFolder.fid]);


  // --- Actions ---

  const handleFolderSelect = (folder: FolderItem) => {
    // בלחיצה אחת - בוחרים (כמו ב-Web)
    if (selectedFolder?.fid === folder.fid) {
        setSelectedFolder(null); // Deselect
    } else {
        setSelectedFolder(folder);
    }
  };

  const enterFolder = (folder: FolderItem) => {
    if (!folder.fid) return;
    setActiveTab('all');
    setCurrentPath(prev => [...prev, { fid: folder.fid, name: folder.name }]);
    setSelectedFolder(null);
    setSearchQuery('');
  };

  const handleGoBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => {
        const newPath = [...prev];
        newPath.pop();
        return newPath;
      });
      setSelectedFolder(null);
    } else {
       // אם אי אפשר לחזור אחורה יותר, אולי נרצה לסגור או לא לעשות כלום
    }
  };

  const handleMove = async () => {
    const destinationId = selectedFolder ? selectedFolder.fid : currentFolder.fid;
    
    // הגנה: לא להעביר לאותו מקום
    if (destinationId === originParentId) {
        onClose();
        return;
    }

    try {
      const res = await patchFile(fileId, { parent_id: destinationId });
      if (res && (res.ok || res.status === 200)) {
        onMoveSuccess();
        onClose();
      } else {
        alert("Failed to move file");
      }
    } catch (error) {
      console.error("Move error:", error);
      alert("Error moving file");
    }
  };

  // כפתור ה-Move פעיל אם בחרנו תיקייה, או שאנחנו בתוך תיקייה שונה מהמקור
  const isMoveEnabled = selectedFolder !== null || (currentFolder.fid !== originParentId);

  // --- Renders ---

  const renderFolderItem = ({ item }: { item: FolderItem }) => {
    const isSelected = selectedFolder?.fid === item.fid;
    
    return (
      <TouchableOpacity 
        style={[
            localStyles.folderItem, 
            isSelected && { backgroundColor: theme.bgHover } // הדגשה בבחירה
        ]} 
        onPress={() => handleFolderSelect(item)}
      >
        <View style={localStyles.itemLeft}>
          <Image source={FOLDER_ICON} style={styles.folderImage} />
          <Text style={[styles.folderName, { color: theme.textMain }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        
        {/* כפתור חץ כדי להיכנס פנימה (מקביל לדאבל-קליק ב-Web) */}
        <TouchableOpacity style={localStyles.arrowButton} onPress={() => enterFolder(item)}>
             {/* אם אין לך אייקון חץ, נשתמש בטקסט זמנית */}
             <Text style={{color: theme.textSecondary, fontSize: 18}}>{'>'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.bgMain }]}>

          {/* --- Header --- */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle, flexDirection: 'column', height: 'auto', paddingBottom: 10 }]}>
             
             {/* שורת כותרת + סגירה */}
             <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={[styles.headerMainTitle, { color: theme.textMain, fontSize: 18 }]}>
                    Move "{fileName}"
                </Text>
                <TouchableOpacity onPress={onClose}>
                    <Image source={CLOSE_ICON} style={[styles.actionIconImage, { tintColor: theme.textSecondary }]} />
                </TouchableOpacity>
             </View>

             {/* שורת מיקום (Breadcrumbs) */}
             <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                {currentPath.length > 1 ? (
                    <TouchableOpacity onPress={handleGoBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={BACK_ICON} style={[styles.backIconImage, { tintColor: theme.brandBlue, marginRight: 5 }]} />
                        <Text style={{ color: theme.textMain, fontWeight: '600' }}>{currentFolder.name}</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={{ color: theme.textSecondary }}>Current: {originParentName}</Text>
                )}
             </View>
          </View>

          {/* --- Tabs --- */}
          <View style={localStyles.tabsContainer}>
             <TouchableOpacity 
                style={[localStyles.tab, activeTab === 'starred' && localStyles.activeTab]}
                onPress={() => setActiveTab('starred')}
             >
                <Text style={[localStyles.tabText, { color: activeTab === 'starred' ? theme.brandBlue : theme.textSecondary }]}>Starred</Text>
             </TouchableOpacity>
             
             <TouchableOpacity 
                style={[localStyles.tab, activeTab === 'all' && localStyles.activeTab]}
                onPress={() => setActiveTab('all')}
             >
                <Text style={[localStyles.tabText, { color: activeTab === 'all' ? theme.brandBlue : theme.textSecondary }]}>All locations</Text>
             </TouchableOpacity>
          </View>

          {/* --- Search Bar --- */}
          {showSearchBar && (
             <View style={[styles.searchContainer, { borderBottomColor: theme.borderSubtle, marginTop: 0 }]}>
                <Image source={SEARCH_ICON} style={[styles.actionIconImage, { tintColor: theme.textSecondary, marginRight: 10 }]} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textMain }]}
                  placeholder="Search folders"
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                   <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Image source={CLOSE_ICON} style={[styles.actionIconImage, { tintColor: theme.textSecondary, width: 18, height: 18 }]} />
                   </TouchableOpacity>
                )}
             </View>
          )}

          {/* --- Content List --- */}
          {isInit || isLoadingFolders ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={theme.brandBlue} />
            </View>
          ) : (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.fid}
              renderItem={renderFolderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                   <Text style={{ color: theme.textSecondary, marginTop: 20 }}>
                      {searchQuery ? "No search results" : "No folders here"}
                   </Text>
                </View>
              }
            />
          )}

          {/* --- Footer --- */}
          <View style={[styles.footer, { backgroundColor: theme.bgMain, borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
              <Text style={{ color: theme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                  styles.moveButton, 
                  { backgroundColor: isMoveEnabled ? theme.brandBlue : theme.bgHover, opacity: isMoveEnabled ? 1 : 0.7 }
              ]}
              onPress={handleMove}
              disabled={!isMoveEnabled}
            >
              <Text style={[styles.moveButtonText, { color: isMoveEnabled ? '#fff' : theme.textSecondary }]}>
                Move
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

// סגנונות מקומיים לטאבים ולרשימה
const localStyles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1a73e8', // Brand Blue
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    folderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // רווח בין השם לחץ
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    arrowButton: {
        padding: 10,
    }
});

export default MoveItemModal;