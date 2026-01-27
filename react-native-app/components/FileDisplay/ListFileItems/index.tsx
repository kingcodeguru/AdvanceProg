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
import RenameModal from './RenameFileModal'; 
import MoveFileModal from './MoveItemModal'; 

interface ListFileItemsProps {
  files: any[];
  viewMode: 'box' | 'line';
  onRefresh: () => void;
  showFooter?: boolean;
  onScroll?: (event: any) => void; // <-- הוספת ה-Prop כאן
}

const ListFileItems = ({ files, viewMode, onRefresh, showFooter, onScroll }: ListFileItemsProps) => {
  const router = useRouter();
  
  // State
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // Modals
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // ... (כל הלוגיקה של handleRenameSubmit, toggleStar, deleteAction נשארת זהה)

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

  // --- Logic: Download ---
  const downloadSingleFile = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      if (!response.ok) {
        Alert.alert("Error", "Failed to download file data");
        return;
      }
      const fileData = await response.json();
      
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;
      const localUri = directory + file.name;

      let contentToWrite = fileData.content;
      let encodingOption: 'utf8' | 'base64' = 'utf8';
      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

      if (isImage) {
        contentToWrite = contentToWrite.replace(/^data:image\/\w+;base64,/, "");
        encodingOption = 'base64';
      }

      await FileSystem.writeAsStringAsync(localUri, contentToWrite, { encoding: encodingOption });

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

  // --- Handlers ---
  const handleListSignal = (signal: string, file: any) => {
    if (signal === 'open') {
      if (file.type === 'directory') {
        router.push(`/drive/directories/${file.fid}` as any);
      } else if (file.type === 'image') {
        router.push(`/drive/images/${file.fid}` as any);
      } else {
        router.push(`/drive/files/${file.fid}` as any);
      }
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
        case 'restore': 
          try {
            const response = await patchFile(selectedFile.fid, { trashed: false });
            if (response.ok && onRefresh) onRefresh();
          } catch (e) { console.error(e); }
          break;
      }
      if (actionName !== 'rename' && actionName !== 'move') setSelectedFile(null);
    }, 300);
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {viewMode === 'line' ? (
        <ListLineFileItems 
          files={files} 
          onAction={handleListSignal} 
          onScroll={onScroll} // <-- העברה לקומפוננטת השורות
        />
      ) : (
        <ListBoxFileItems 
          files={files} 
          showFooter={showFooter} 
          onAction={handleListSignal} 
          onScroll={onScroll} // <-- העברה לקומפוננטת הקוביות
        />
      )}

      {/* Modals ... נשארים אותו דבר */}
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
      {/* Rename & Move Modals ... */}
    </View>
  );
};

export default ListFileItems;