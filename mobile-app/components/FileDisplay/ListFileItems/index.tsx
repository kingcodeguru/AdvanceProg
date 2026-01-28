import React, { useState } from 'react';
import { View, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// שימוש ב-legacy למניעת שגיאות deprecated (אקספו 54+)
import * as FileSystem from 'expo-file-system/legacy';
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
  
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // --- Helper: זיהוי סוג קובץ ---
  const getMimeType = (filename: string) => {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.txt')) return 'text/plain';
    if (filename.endsWith('.doc') || filename.endsWith('.docx')) return 'application/msword';
    if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) return 'application/vnd.ms-excel';
    if (filename.endsWith('.ppt') || filename.endsWith('.pptx')) return 'application/vnd.ms-powerpoint';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    return 'application/octet-stream';
  };

  // --- 1. Rename Logic ---
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

  // --- 2. Star Logic ---
  const toggleStar = async (file: any, newStatus: boolean) => {
    try {
      const response = await setStar(file.fid, newStatus);
      if (response.ok && onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  // --- 3. Delete Logic ---
  const deleteAction = async (file: any) => {
    const performDelete = async () => {
      try {
        const response = file.trashed 
          ? await deleteFile(file.fid) 
          : await patchFile(file.fid, { trashed: true });
        
        if (response.ok && onRefresh) onRefresh();
      } catch (error) {
        console.error(error);
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

  // --- 4. Download Logic ---
  const downloadSingleFile = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      if (!response.ok) return;
      const fileData = await response.json();

      let content = fileData.content;
      let encoding: any = 'utf8'; 
      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

      if (isImage) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }

      // === תמונות: שמירה לגלריה ===
      if (isImage) {
        const localUri = `${FileSystem.cacheDirectory}${file.name}`;
        await FileSystem.writeAsStringAsync(localUri, content, { encoding });
        
        // תיקון: requestPermissionsAsync(true) מבקש רק הרשאת כתיבה (מונע קריסת AUDIO)
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert("Success", "Saved to gallery!");
        } else {
          Alert.alert("Permission Required", "Allow photo access to save images.");
        }
        return;
      }

      // === קבצים: אנדרואיד (דיאלוג שמירה) ===
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          const mimeType = getMimeType(file.name);
          const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri, 
            file.name, 
            mimeType
          );
          await FileSystem.writeAsStringAsync(newFileUri, content, { encoding });
          Alert.alert("Success", "File saved!");
        }
      } 
      // === קבצים: iOS (שיתוף) ===
      else {
        const localUri = `${FileSystem.documentDirectory}${file.name}`;
        await FileSystem.writeAsStringAsync(localUri, content, { encoding });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Download failed.");
    }
  };

  // --- 5. Send Copy Logic ---
  const sendCopyAction = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      const fileData = await response.json();
      
      const directory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
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

  // --- Main Signal Handler (התיקון לבעיית הלחיצה הכפולה) ---
  // פונקציה זו מקבלת את הקובץ ישירות מהרשימה ומטפלת בו מיד
  const handleListSignal = (signal: string, file: any) => {
    if (signal === 'open') {
      // פתיחה ישירה עם הקובץ שהתקבל (עוקף את הדיליי של State)
      const path = file.type === 'directory' ? 'directories' : (file.type === 'image' ? 'images' : 'files');
      router.push(`/drive/${path}/${file.fid}` as any);
    } else if (signal === 'menu') {
      // למודאל אנחנו צריכים State, אז כאן זה בסדר
      setSelectedFile(file);
      setIsActionModalOpen(true); 
    }
  };

  // --- Modal Action Handler ---
  const handleModalAction = async (actionName: string) => {
    setIsActionModalOpen(false); 
    if (!selectedFile) return;

    setTimeout(async () => {
      switch (actionName) {
        case 'open': 
           // אם הפתיחה היא מהמודאל, selectedFile כבר קיים ותקין
           handleListSignal('open', selectedFile);
           break;
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
        <ListLineFileItems 
          files={files} 
          onAction={handleListSignal} // שליחה ישירה של הפונקציה המתוקנת
          onScroll={onScroll} 
        />
      ) : (
        <ListBoxFileItems 
          files={files} 
          showFooter={showFooter} 
          onAction={handleListSignal} // שליחה ישירה של הפונקציה המתוקנת
          onScroll={onScroll} 
        />
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