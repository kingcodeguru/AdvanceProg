import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// --- Imports ---
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// API Imports
import { patchFile, deleteFile, setStar, getFileById } from '@/utilities/api';

// Components Imports
import ListBoxFileItems from './ListBoxFileItems';
import ListLineFileItems from './ListLineFileItems';
import FileActionModal from './FileActionModal'; 
import RenameModal from './RenameModal/index'; 
import MoveFileModal from './MoveFileModal/index'; 

interface ListFileItemsProps {
  files: any[];
  viewMode: 'box' | 'line';
  onRefresh: () => void;
  showFooter?: boolean;
}

const ListFileItems = ({ files, viewMode, onRefresh, showFooter }: ListFileItemsProps) => {
  const router = useRouter();
  
  // State
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // Modals
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // --- Logic: Rename ---
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
      console.error(error);
    }
  };

  // --- Logic: Star ---
  const toggleStar = async (file: any, newStatus: boolean) => {
    try {
      const response = await setStar(file.fid, newStatus);
      if (response.ok && onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  // --- Logic: Delete ---
  const deleteAction = async (file: any) => {
    const performDelete = async () => {
      try {
        let response;
        if (file.trashed) {
          response = await deleteFile(file.fid);
        } else {
          response = await patchFile(file.fid, { trashed: true });
        }
        
        if (response.ok && onRefresh) {
          onRefresh();
        } else {
          Alert.alert("Error", "Action failed");
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (file.trashed) {
      Alert.alert(
        "Delete Forever",
        "This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete }
        ]
      );
    } else {
      await performDelete();
    }
  };

  // --- Logic: Download (Fixed & Working) ---
  const downloadSingleFile = async (file: any) => {
    try {
      // 1. הורדת המידע
      const response = await getFileById(file.fid);
      if (!response.ok) {
        Alert.alert("Error", "Failed to download file data");
        return;
      }
      const fileData = await response.json();
      
      if (!fileData || fileData.content === undefined) {
        Alert.alert("Error", "File content is empty");
        return;
      }

      // 2. הגדרת נתיב שמירה
      // התיקון: אנחנו מכריחים את TS לקבל את זה ע"י (FileSystem as any)
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;
      
      if (!directory) {
         Alert.alert("Error", "No valid directory found on device");
         return;
      }
      
      const localUri = directory + file.name;

      let contentToWrite = fileData.content;
      let encodingOption: 'utf8' | 'base64' = 'utf8';

      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

      if (isImage) {
        contentToWrite = contentToWrite.replace(/^data:image\/\w+;base64,/, "");
        encodingOption = 'base64';
      }

      // 3. כתיבת הקובץ
      await FileSystem.writeAsStringAsync(localUri, contentToWrite, {
        encoding: encodingOption
      });

      // 4. שיתוף/שמירה
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      } else {
        Alert.alert("Download Complete", `File saved to: ${localUri}`);
      }

    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Could not download file.");
    }
  };

  // --- Logic: Navigation ---
  const openAction = (file: any) => { 
    if (file.type === 'directory') {
      router.push(`/drive/directories/${file.fid}` as any);
    } else if (file.type === 'image') {
       router.push(`/drive/images/${file.fid}` as any);
    } else {
       router.push(`/drive/files/${file.fid}` as any);
    }
  };

  // --- Logic: Copy Link ---
  const copyLinkAction = (file: any) => { 
    const link = `this needs to be implemented`; 
    Alert.alert("File Link: ", link);
  };

  // --- Logic: Restore ---
  const restoreFile = async (file: any) => {
    try {
      const response = await patchFile(file.fid, { trashed: false });
      if (response.ok && onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  // --- Handlers ---
  const handleListSignal = (signal: string, file: any) => {
    if (signal === 'open') {
      openAction(file);
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
        case 'rename': setIsRenameModalOpen(true); break;
        case 'move': setIsMoveModalOpen(true); break;
        case 'add_star': await toggleStar(selectedFile, true); break;
        case 'remove_star': await toggleStar(selectedFile, false); break;
        case 'delete': await deleteAction(selectedFile); break;
        case 'download': await downloadSingleFile(selectedFile); break;
        case 'share_file': Alert.alert("Share", "Coming soon..."); break;
        case 'copy_link': copyLinkAction(selectedFile); break;
        case 'restore': await restoreFile(selectedFile); break;
      }
      
      if (actionName !== 'rename' && actionName !== 'move') {
        setSelectedFile(null);
      }
    }, 300);
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {viewMode === 'line' ? (
        <ListLineFileItems files={files} onAction={handleListSignal} />
      ) : (
        <ListBoxFileItems files={files} showFooter={showFooter} onAction={handleListSignal} />
      )}

      {selectedFile && (
        <FileActionModal
          visible={isActionModalOpen}
          onClose={() => { setIsActionModalOpen(false); setSelectedFile(null); }}
          fileID={selectedFile.fid}
          fileName={selectedFile.name}
          fileType={selectedFile.type}
          isStarred={selectedFile.starred}
          isTrashed={selectedFile.trashed}
          onAction={handleModalAction}
        />
      )}

      {isRenameModalOpen && selectedFile && (
        <RenameModal 
          visible={isRenameModalOpen}
          fileName={selectedFile.name} 
          onClose={() => { setIsRenameModalOpen(false); setSelectedFile(null); }}
          onRename={handleRenameSubmit} 
        />
      )}

      {isMoveModalOpen && selectedFile && (
        <MoveFileModal 
          visible={isMoveModalOpen}
          fileId={selectedFile.fid}
          fileName={selectedFile.name}
          onClose={() => { setIsMoveModalOpen(false); setSelectedFile(null); }}
          onMoveSuccess={() => { if (onRefresh) onRefresh(); }}
        />
      )}
    </View>
  );
};

export default ListFileItems;