import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// --- Imports ---
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
  
  // Modals
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // --- לוגיקה: שמירת קובץ (Download) ---
  const downloadSingleFile = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      if (!response.ok) {
        Alert.alert("Error", "Failed to get file data");
        return;
      }
      const fileData = await response.json();
      
      const directory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const localUri = directory + file.name;

      let contentToWrite = fileData.content;
      let encodingOption: 'utf8' | 'base64' = 'utf8';
      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

      if (isImage) {
        contentToWrite = contentToWrite.replace(/^data:image\/\w+;base64,/, "");
        encodingOption = 'base64';
      }

      // כתיבת הקובץ זמנית
      await FileSystem.writeAsStringAsync(localUri, contentToWrite, { encoding: encodingOption });

      if (isImage) {
        // בקשת הרשאה ושמירה לגלריה
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert("Success", "Image saved to gallery!");
        } else {
          Alert.alert("Permission Denied", "Cannot save image without gallery access.");
        }
      } else {
        // עבור קבצים שאינם תמונה, במובייל הדרך הכי נכונה "להוריד" היא לפתוח את תפריט ה-Save to Files
        // אבל כאן אנחנו משתמשים בזה כ"הורדה" נטו.
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(localUri); // ב-iOS זה יפתח את ה-Save to Files
        } else {
            Alert.alert("Download Complete", `Saved to: ${localUri}`);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Could not save file.");
    }
  };

  // --- לוגיקה: שליחת עותק (Send a Copy) ---
  const sendCopyAction = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      const fileData = await response.json();
      
      const localUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + file.name;
      let content = fileData.content;
      let encoding: 'utf8' | 'base64' = 'utf8';

      if (file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }

      await FileSystem.writeAsStringAsync(localUri, content, { encoding });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, { dialogTitle: `Send a copy of ${file.name}` });
      } else {
        Alert.alert("Not Available", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Send copy error:", error);
    }
  };

  // --- Handlers ---
  const handleListSignal = (signal: string, file: any) => {
    if (signal === 'open') {
      if (file.type === 'directory') router.push(`/drive/directories/${file.fid}` as any);
      else if (file.type === 'image') router.push(`/drive/images/${file.fid}` as any);
      else router.push(`/drive/files/${file.fid}` as any);
    } else if (signal === 'menu') {
      setSelectedFile(file);
      setIsActionModalOpen(true); 
    }
  };

  const handleModalAction = async (actionName: string) => {
    setIsActionModalOpen(false); 
    if (!selectedFile) return;

    // השהייה קלה כדי לאפשר למודאל הקודם להיסגר בצורה חלקה
    setTimeout(async () => {
      switch (actionName) {
        case 'open': handleListSignal('open', selectedFile); break;
        case 'rename': setIsRenameModalOpen(true); break;
        case 'move': setIsMoveModalOpen(true); break;
        case 'add_star': await toggleStar(selectedFile, true); break;
        case 'remove_star': await toggleStar(selectedFile, false); break;
        case 'delete': await deleteAction(selectedFile); break;
        case 'download': await downloadSingleFile(selectedFile); break;
        case 'send_copy': await sendCopyAction(selectedFile); break; // מימוש שליחת עותק
        case 'restore': 
          try {
            const response = await patchFile(selectedFile.fid, { trashed: false });
            if (response.ok && onRefresh) onRefresh();
          } catch (e) { console.error(e); }
          break;
        case 'share_file':
          router.push(`/drive/files/permissions/${selectedFile.fid}` as any);
          break;
      }
      
      if (actionName !== 'rename' && actionName !== 'move') {
          setSelectedFile(null);
      }
    }, 300);
  };

  // ... (שאר הקומפוננטה: handleRenameSubmit, toggleStar, וכו' נשארים אותו דבר)

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