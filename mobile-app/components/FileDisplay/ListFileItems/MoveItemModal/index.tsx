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
import { styles } from './styles';

// API Imports
import { 
  getFilesByDirectory, 
  patchFile, 
  getFilesBySearch, 
  getFileById, 
  getAllFiles,
  getAllStaredFiles, 
  getRole 
} from '@/utilities/api'; 
import { can_edit } from '@/utilities/roles';

// Theme
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

// --- Images ---
const FOLDER_ICON = require('@/assets/images/dir_logo.png'); 
const DRIVE_ICON = FOLDER_ICON; // ניתן לשנות לאייקון אחר אם יש
const BACK_ICON = require('@/assets/images/back_icon.png');
const SEARCH_ICON = require('@/assets/images/search_icon.png');
const CLOSE_ICON = require('@/assets/images/x_icon.png');

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
  isRootRedirect?: boolean;
}

const MoveItemModal = ({ visible, fileId, fileName, onClose, onMoveSuccess }: MoveFileModalProps) => {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  // --- State ---
  const [isInit, setIsInit] = useState(true);
  const [originParentId, setOriginParentId] = useState<string | null>(null);
  const [originParentName, setOriginParentName] = useState<string>('My Drive');

  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  const [currentPath, setCurrentPath] = useState<{fid: string, name: string}[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // סטייט לניווט חד פעמי
  const [hasNavigated, setHasNavigated] = useState(false);

  // --- 1. Init Logic ---
  useEffect(() => {
    if (visible && fileId) {
      setHasNavigated(false);
      let mounted = true;
      const init = async () => {
        try {
          setIsInit(true);
          const fileRes = await getFileById(fileId);
          const fileData = fileRes.json ? await fileRes.json() : fileRes;
          
          const parentId = fileData.parent_id || 'root';
          if (mounted) setOriginParentId(parentId);

          let startName = 'My Drive';
          let startId = 'root';

          if (parentId !== 'root' && parentId !== null) {
              startId = parentId;
             try {
               const parentRes = await getFileById(parentId);
               const parentData = parentRes.json ? await parentRes.json() : parentRes;
               startName = parentData.name || 'Unknown';
             } catch (err) { console.log("Parent fetch error"); }
          }
          
          if (mounted) {
            setOriginParentName(startName);
            setCurrentPath([{ fid: startId, name: startName }]);
            setIsInit(false);
          }
        } catch (e) {
          if (mounted) {
            setOriginParentId('root');
            setOriginParentName('My Drive');
            setCurrentPath([{ fid: 'root', name: 'My Drive' }]);
            setIsInit(false);
          }
        }
      };
      init();
      return () => { mounted = false; };
    }
  }, [visible, fileId]);

  const currentFolder = currentPath.length > 0 
    ? currentPath[currentPath.length - 1] 
    : { fid: 'root', name: 'My Drive' };

  // --- 2. Load Folders Logic ---
  const loadFolders = useCallback(async () => {
    if (!visible || isInit) return;
    setLoading(true);
    try {
      let response;
      let isSearch = false;
      const targetId = currentFolder.fid || 'root';

      if (searchQuery.length > 0 && isSearchActive) {
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
        if (!Array.isArray(data)) data = data ? [data] : [];

        data = data.map((item: any) => ({
           ...item,
           fid: item.fid || item.id,
           name: item.name || 'Untitled',
        }));

        if (!isSearch && targetId === 'root' && activeTab === 'all') {
             data = data.filter((item: any) => !item.parent_id || item.parent_id === 'root');
        }
        if (isSearch && activeTab === 'starred') {
             data = data.filter((item: any) => item.starred === true);
        }

        const candidates = data.filter((item: any) => 
           (item.type === 'directory' || item.type === 'dir' || item.type === 'folder') &&
           item.fid !== fileId &&
           item.fid !== originParentId && 
           item.fid !== currentFolder.fid
        );

        const allowedFolders: FolderItem[] = [];

        // הוספת My Drive אם צריך
        if (
            originParentId !== 'root' && 
            originParentId !== null &&
            !isSearch && 
            currentPath.length === 1 && 
            activeTab === 'all' &&
            !hasNavigated
        ) {
            allowedFolders.push({
                fid: 'root',
                name: 'My Drive',
                type: 'directory',
                isRootRedirect: true
            });
        }

        for (const folder of candidates) {
            try {
                const role = await getRole(folder.fid);
                if (can_edit(role)) allowedFolders.push(folder);
            } catch(e) {}
        }
        setFolders(allowedFolders);
      }
    } catch (error) {
      console.error("Fetch folders failed", error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [visible, searchQuery, currentFolder.fid, fileId, isInit, activeTab, isSearchActive, originParentId, hasNavigated]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { setSearchQuery(''); }, [activeTab, currentFolder.fid]);

  // --- Actions ---

  const handleEnterFolder = (folder: FolderItem) => {
    setSearchQuery('');
    setActiveTab('all'); 
    setIsSearchActive(false);
    setHasNavigated(true);

    if (folder.isRootRedirect) {
        setCurrentPath([{ fid: 'root', name: 'My Drive' }]);
        return;
    }

    setCurrentPath(prev => [...prev, { fid: folder.fid, name: folder.name }]);
  };

  const handleGoBack = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setSearchQuery('');
      return;
    }
    if (currentPath.length > 1) {
      setCurrentPath(prev => {
        const newPath = [...prev];
        newPath.pop();
        return newPath;
      });
    } else {
      onClose(); 
    }
  };

  const handleMove = async () => {
    const destinationId = currentFolder.fid;
    if (destinationId === originParentId) return;

    try {
      const res = await patchFile(fileId, { parent_id: destinationId });
      if (res && (res.ok || res.status === 200)) {
        onMoveSuccess();
        onClose();
      } else {
        alert("Failed to move");
      }
    } catch (error) {
      console.error(error);
      alert("Error moving file");
    }
  };

  const isAtOrigin = currentFolder.fid === originParentId;
  const showSearchBar = activeTab === 'starred' || (activeTab === 'all' && currentPath.length === 1);

  // --- Render Item ---
  const renderFolderItem = ({ item }: { item: FolderItem }) => (
    <TouchableOpacity style={styles.folderItem} onPress={() => handleEnterFolder(item)}>
      <View style={styles.folderIconContainer}>
        <Image 
            source={item.isRootRedirect ? DRIVE_ICON : FOLDER_ICON} 
            defaultSource={FOLDER_ICON}
            style={styles.folderImage} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.folderName, { color: theme.textMain, fontWeight: item.isRootRedirect ? 'bold' : 'normal' }]} numberOfLines={1}>
            {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.bgMain }]}>

          {/* --- Header --- */}
          {!isSearchActive ? (
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle, flexDirection: 'column', height: 'auto', paddingBottom: 10 }]}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={[styles.headerMainTitle, { color: theme.textMain, fontSize: 18, marginLeft: 15 }]}>
                    Move "{fileName}"
                  </Text>
                  
                  {showSearchBar && (
                      <TouchableOpacity onPress={() => setIsSearchActive(true)} style={[styles.iconButton, { marginRight: 15 }]}>
                        <Image source={SEARCH_ICON} style={[styles.actionIconImage, { tintColor: theme.textMain }]} />
                      </TouchableOpacity>
                  )}
              </View>

              {/* התיקון: הוספתי width: 100% ו-justifyContent: flex-start כדי להצמיד לשמאל */}
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, width: '100%', justifyContent: 'flex-start' }}>
                 {currentPath.length > 1 ? (
                    <TouchableOpacity onPress={handleGoBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                       <Image source={BACK_ICON} style={[styles.backIconImage, { tintColor: theme.brandBlue, width: 20, height: 20, marginRight: 8 }]} />
                       <Text style={{ color: theme.textMain, fontWeight: '600', fontSize: 16 }}>{currentFolder.name}</Text>
                    </TouchableOpacity>
                 ) : (
                    <Text style={{ color: theme.textSecondary }}>Current location: {originParentName}</Text>
                 )}
              </View>

              {currentPath.length === 1 && (
                  <View style={{ flexDirection: 'row', marginTop: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <TouchableOpacity 
                          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'all' ? theme.brandBlue : 'transparent' }}
                          onPress={() => setActiveTab('all')}
                      >
                          <Text style={{ color: activeTab === 'all' ? theme.brandBlue : theme.textSecondary, fontWeight: '600' }}>All locations</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === 'starred' ? theme.brandBlue : 'transparent' }}
                          onPress={() => setActiveTab('starred')}
                      >
                          <Text style={{ color: activeTab === 'starred' ? theme.brandBlue : theme.textSecondary, fontWeight: '600' }}>Starred</Text>
                      </TouchableOpacity>
                  </View>
              )}
            </View>
          ) : (
            <View style={[styles.searchContainer, { borderBottomColor: theme.borderSubtle }]}>
               <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
                  <Image source={BACK_ICON} style={[styles.backIconImage, { tintColor: theme.textMain }]} />
               </TouchableOpacity>
               
               <TextInput
                 style={[styles.searchInput, { color: theme.textMain }]}
                 placeholder="Search destination"
                 placeholderTextColor={theme.textSecondary}
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 autoFocus
               />
               
               {searchQuery.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchQuery('')}>
                   <Image source={CLOSE_ICON} style={[styles.actionIconImage, { tintColor: theme.textSecondary }]} />
                 </TouchableOpacity>
               )}
            </View>
          )}

          {/* --- Content --- */}
          {loading || isInit ? (
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
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      {searchQuery ? "No folders found" : "No folders here"}
                  </Text>
                </View>
              }
            />
          )}

          {/* --- Footer --- */}
          <View style={[styles.footer, { backgroundColor: theme.bgMain, borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cancelButtonText, { color: theme.brandBlue }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                  styles.moveButton, 
                  { backgroundColor: isAtOrigin ? theme.bgHover : theme.brandBlue },
              ]}
              onPress={handleMove}
              disabled={isAtOrigin}
            >
              <Text style={[
                  styles.moveButtonText, 
                  { color: isAtOrigin ? theme.textSecondary : '#fff' }
              ]}>
                Move here
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default MoveItemModal;