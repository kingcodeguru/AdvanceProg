import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

// שינוי ייבוא לפורמט בטוח יותר
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

// API Imports
import { patchFile, deleteFile, setStar, getFileById } from '@/utilities/api';

// Components Imports
import ListBoxFileItems from './ListBoxFileItems';
import ListLineFileItems from './ListLineFileItems';
import FileActionModal from './FileActionModal';
import RenameFileModal from './RenameFileModal'; 
import MoveItemModal from './MoveItemModal'; 

interface ListFileItemsProps {
  files: any[];
  viewMode: 'box' | 'line';
  onRefresh: () => void;
  showFooter?: boolean;
  onScroll?: (event: any) => void;
}

const ListFileItems = ({ files, viewMode, onRefresh, showFooter, onScroll }: ListFileItemsProps) => {
  const router = useRouter();
  
  // State
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // --- 1. לוגיקה: Rename ---
  const handleRenameSubmit = async (newName: string) => {
    if (!selectedFile) return;
    try {
      const response = await patchFile(selectedFile.fid, { name: newName });
      if (response.ok) {
        setIsRenameModalOpen(false);
        setSelectedFile(null);
        if (onRefresh) onRefresh();
      } else {
        Alert.alert("Error", "Rename failed");
      }
    } catch (error) {
      console.error("Rename Error:", error);
    }
  };

  // --- 2. לוגיקה: Star ---
  const toggleStar = async (file: any, newStatus: boolean) => {
    try {
      const response = await setStar(file.fid, newStatus);
      if (response.ok && onRefresh) onRefresh();
    } catch (error) {
      console.error("Star Error:", error);
    }
  };

  // --- 3. לוגיקה: Delete ---
  const deleteAction = async (file: any) => {
    const performDelete = async () => {
      try {
        const response = file.trashed 
          ? await deleteFile(file.fid) 
          : await patchFile(file.fid, { trashed: true });
        
        if (response.ok && onRefresh) onRefresh();
        else Alert.alert("Error", "Action failed");
      } catch (error) {
        console.error("Delete Error:", error);
      }
    };

    if (file.trashed) {
      Alert.alert("Delete Forever", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete }
      ]);
    } else {
      await performDelete();
    }
  };

  // --- 4. לוגיקה: Download (שמירה לגלריה) ---
  const downloadSingleFile = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      if (!response.ok) return;
      const fileData = await response.json();
      
      // שימוש בגישה דינמית למניעת שגיאות Type
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;
      const localUri = `${directory}${file.name}`;

      let content = fileData.content;
      let encoding: any = 'utf8'; 

      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);
      if (isImage) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }

      await FileSystem.writeAsStringAsync(localUri, content, { encoding });

      if (isImage) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert("Success", "Saved to gallery!");
        }
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // --- 5. לוגיקה: Send a Copy (שיתוף עותק) ---
  const sendCopyAction = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      const fileData = await response.json();
      
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;
      const localUri = `${directory}${file.name}`;
      
      let content = fileData.content;
      let encoding: any = 'utf8';

      if (file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }

      await FileSystem.writeAsStringAsync(localUri, content, { encoding });
      await Sharing.shareAsync(localUri, { dialogTitle: `Send a copy of ${file.name}` });
    } catch (error) {
      console.error("Send copy error:", error);
    }
  };

  // --- Handlers ---
  const handleListSignal = (signal: string, file: any) => {
    if (signal === 'open') {
      const path = file.type === 'directory' ? 'directories' : (file.type === 'image' ? 'images' : 'files');
      router.push(`/drive/${path}/${file.fid}` as any);
    } else if (signal === 'menu') {
      setSelectedFile(file);
      setIsActionModalOpen(true); 
    }
  };

  const handleModalAction = async (actionName: string) => {
    setIsActionModalOpen(false); 
    if (!selectedFile) return;

    setTimeout(async () => {
      switch (actionName) {
        case 'open': handleListSignal('open', selectedFile); break;
        case 'rename': setIsRenameModalOpen(true); break;
        case 'move': setIsMoveModalOpen(true); break;
        case 'add_star': await toggleStar(selectedFile, true); break;
        case 'remove_star': await toggleStar(selectedFile, false); break;
        case 'delete': await deleteAction(selectedFile); break;
        case 'download': await downloadSingleFile(selectedFile); break;
        case 'send_copy': await sendCopyAction(selectedFile); break;
        case 'restore': 
          try {
            const res = await patchFile(selectedFile.fid, { trashed: false });
            if (res.ok && onRefresh) onRefresh();
          } catch (e) { console.error(e); }
          break;
        case 'share_file':
          router.push(`/drive/files/permissions/${selectedFile.fid}` as any);
          break;
      }
      if (actionName !== 'rename' && actionName !== 'move') setSelectedFile(null);
    }, 300);
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {viewMode === 'line' ? (
        <ListLineFileItems files={files} onAction={handleListSignal} onScroll={onScroll} />
      ) : (
        <ListBoxFileItems files={files} showFooter={showFooter} onAction={handleListSignal} onScroll={onScroll} />
      )}

      {selectedFile && (
        <>
          <FileActionModal
            visible={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            fileID={selectedFile.fid}
            fileName={selectedFile.name}
            fileType={selectedFile.type}
            isStarred={selectedFile.starred}
            isTrashed={selectedFile.trashed}
            onAction={handleModalAction}
          />

          <RenameFileModal
            visible={isRenameModalOpen}
            fileName={selectedFile.name} 
            onClose={() => { setIsRenameModalOpen(false); setSelectedFile(null); }}
            onRename={handleRenameSubmit}
          />

          <MoveItemModal
            visible={isMoveModalOpen}
            fileId={selectedFile.fid}
            fileName={selectedFile.name}
            onClose={() => { setIsMoveModalOpen(false); setSelectedFile(null); }}
            onMoveSuccess={() => { onRefresh(); setIsMoveModalOpen(false); setSelectedFile(null); }}
          />
        </>
      )}
    </View>
  );
};

export default ListFileItems;