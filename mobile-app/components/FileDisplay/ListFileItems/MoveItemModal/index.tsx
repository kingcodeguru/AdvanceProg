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
  Image 
} from 'react-native';
import { styles } from './styles';
import { getFilesByDirectory, patchFile, getFilesBySearch, getFileById, getAllFiles } from '@/utilities/api'; 

// 1. Import Theme Hooks
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

// --- Images ---
const FOLDER_ICON = require('@/assets/images/dir_logo.png'); 
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
}

const MoveItemModal = ({ visible, fileId, fileName, onClose, onMoveSuccess }: MoveFileModalProps) => {
  // 2. Get Current Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const [currentPath, setCurrentPath] = useState<{fid: string, name: string}[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [originParentId, setOriginParentId] = useState<string | null>(null);
  const [originParentName, setOriginParentName] = useState<string>('My Drive');

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Init
  useEffect(() => {
    if (visible && fileId) {
      const init = async () => {
        try {
          const fileRes = await getFileById(fileId);
          const fileData = fileRes.json ? await fileRes.json() : fileRes;
          const parentId = fileData.parent_id || 'root';
          
          setOriginParentId(parentId);

          let startName = 'My Drive';
          if (parentId !== 'root' && parentId !== null) {
             try {
               const parentRes = await getFileById(parentId);
               const parentData = parentRes.json ? await parentRes.json() : parentRes;
               startName = parentData.name || 'Unknown';
             } catch (err) { 
               console.log("Parent fetch error (ignoring)"); 
             }
          }
          setOriginParentName(startName);
          setCurrentPath([{ fid: parentId, name: startName }]);

        } catch (e) {
          console.log("Server down or init failed -> Fallback to Root");
          setOriginParentId('root');
          setOriginParentName('My Drive');
          setCurrentPath([{ fid: 'root', name: 'My Drive' }]);
        }
      };
      init();
    }
  }, [visible, fileId]);

  const currentFolder = currentPath.length > 0 
    ? currentPath[currentPath.length - 1] 
    : { fid: 'root', name: 'My Drive' };

  // 2. Load Folders
  const loadFolders = useCallback(async () => {
    if (!visible) return;
    setLoading(true);
    try {
      let response;
      if (searchQuery.length > 0) {
        response = await getFilesBySearch(searchQuery);
      } else if (currentFolder.fid === 'root') {
        response = await getAllFiles();
      } else {
        response = await getFilesByDirectory(currentFolder.fid);
      }

      if (response) {
        let data = response.json ? await response.json() : response;
        if (!Array.isArray(data)) data = data ? [data] : [];

        let folderList = data.filter((item: any) => 
            (item.type === 'directory' || item.type === 'dir' || item.type === 'folder') &&
            item.fid !== fileId
        ).map((item: any) => ({
            ...item,
            fid: item.fid || item.id,
            name: item.name || 'Untitled',
        }));

        if (!searchQuery && currentFolder.fid === 'root') {
           folderList = folderList.filter((item: any) => !item.parent_id || item.parent_id === 'root');
        }

        setFolders(folderList);
      }
    } catch (error) {
      console.error("Fetch folders failed", error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [visible, searchQuery, currentFolder.fid, fileId]);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  // --- Actions ---

  const handleEnterFolder = (folder: FolderItem) => {
    setSearchQuery('');
    setIsSearchActive(false);
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
    if (currentFolder.fid === originParentId) return;

    try {
      const res = await patchFile(fileId, { parent_id: currentFolder.fid });
      if (res && (res.ok || res.status === 200)) {
        onMoveSuccess();
        onClose();
      } else {
        alert(`Failed to move - ${(await res?.json()).error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error moving file");
    }
  };

  const isAtOrigin = currentFolder.fid === originParentId;

  // 3. Render Item (Dynamic Colors)
  const renderFolderItem = ({ item }: { item: FolderItem }) => (
    <TouchableOpacity style={styles.folderItem} onPress={() => handleEnterFolder(item)}>
      <View style={styles.folderIconContainer}>
        {/* Folder icon usually keeps its color, but you can tint it if needed */}
        <Image source={FOLDER_ICON} style={styles.folderImage} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.folderName, { color: theme.textMain }]} numberOfLines={1}>
            {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Dynamic Background for SafeArea */}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.bgMain }]}>

          {/* --- Header --- */}
          {!isSearchActive ? (
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                  {/* Tint Back Icon */}
                  <Image source={BACK_ICON} style={[styles.backIconImage, { tintColor: theme.textMain }]} />
                </TouchableOpacity>
                
                <View style={styles.headerTitlesContainer}>
                    <Text style={[styles.headerMainTitle, { color: theme.textMain }]} numberOfLines={1}>
                        Move "{fileName}"
                    </Text>
                    <Text style={[styles.headerSubTitle, { color: theme.textSecondary }]} numberOfLines={1}>
                        {isAtOrigin 
                            ? `Current dir: ${originParentName}` 
                            : currentFolder.name
                        }
                    </Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => setIsSearchActive(true)} style={styles.iconButton}>
                  {/* Tint Search Icon */}
                  <Image source={SEARCH_ICON} style={[styles.actionIconImage, { tintColor: theme.textMain }]} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.searchContainer, { borderBottomColor: theme.borderSubtle }]}>
               <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
                  <Image source={BACK_ICON} style={[styles.backIconImage, { tintColor: theme.textMain }]} />
               </TouchableOpacity>
               
               {/* Search Input Dynamic Colors */}
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
          {loading ? (
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
                      No folders here
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
                  // Active = Brand Blue, Disabled = Hover Color (Greyish)
                  { backgroundColor: isAtOrigin ? theme.bgHover : theme.brandBlue },
              ]}
              onPress={handleMove}
              disabled={isAtOrigin}
            >
              <Text style={[
                  styles.moveButtonText, 
                  // Active = White (on Blue), Disabled = Secondary Text (on Grey)
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