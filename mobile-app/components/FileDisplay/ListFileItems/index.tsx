import React, { useState } from 'react';
// 1. הוספת Platform לייבוא
import { View, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// ייבוא מהנתיב הישן (Legacy) לתיקון שגיאות אקספו
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
      console.error(error);
    }
  };

  // --- 2. לוגיקה: Star ---
  const toggleStar = async (file: any, newStatus: boolean) => {
    try {
      const response = await setStar(file.fid, newStatus);
      if (response.ok && onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
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

  // --- 4. לוגיקה: Download (מתוקן עבור Web ומובייל) ---
  const downloadSingleFile = async (file: any) => {
    try {
      const response = await getFileById(file.fid);
      if (!response.ok) return;
      const fileData = await response.json();

      // --- תרחיש א': אנחנו בדפדפן (Web) ---
      if (Platform.OS === 'web') {
        // יצירת לינק נסתר, לחיצה עליו, ומחיקתו. זה גורם לדפדפן להוריד את הקובץ.
        const anchor = document.createElement('a');
        anchor.href = fileData.content; // ה-Data URI מהשרת
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return; // סיימנו
      }

      // --- תרחיש ב': אנחנו במובייל (iOS/Android) ---
      const directory = FileSystem.cacheDirectory || FileSystem.documentDirectory;
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
        // תמונות נשמרות לגלריה בשקט
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert("Success", "Saved to gallery!");
        }
      } else {
        // קבצים אחרים: פותחים תפריט שמירה (זה המקביל ל"שמירה בשם" במובייל)
        if (await Sharing.isAvailableAsync()) {
          // שינוי קטן: לא שולחים כותרת דיאלוג כדי שזה ירגיש יותר "טבעי" למערכת
          await Sharing.shareAsync(localUri);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download.");
    }
  };

  // --- 5. לוגיקה: Send a Copy (נשאר אותו דבר - שיתוף מפורש) ---
  const sendCopyAction = async (file: any) => {
    if (Platform.OS === 'web') {
      Alert.alert("Info", "On web, use Download to save the file, then share it manually.");
      return;
    }

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
      // כאן אנחנו מוסיפים כותרת כדי להדגיש שזה שיתוף
      await Sharing.shareAsync(localUri, { dialogTitle: `Send a copy of ${file.name}` });
    } catch (error) {
      console.error("Send copy error:", error);
    }
  };

  const handleModalAction = async (actionName: string) => {
    setIsActionModalOpen(false); 
    if (!selectedFile) return;

    setTimeout(async () => {
      switch (actionName) {
        case 'open': 
           const path = selectedFile.type === 'directory' ? 'directories' : (selectedFile.type === 'image' ? 'images' : 'files');
           router.push(`/drive/${path}/${selectedFile.fid}` as any);
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
        <ListLineFileItems files={files} onAction={(sig, file) => {
          if (sig === 'menu') { setSelectedFile(file); setIsActionModalOpen(true); }
          else if (sig === 'open') { setSelectedFile(file); handleModalAction('open'); }
        }} />
      ) : (
        <ListBoxFileItems files={files} showFooter={showFooter} onAction={(sig, file) => {
          if (sig === 'menu') { setSelectedFile(file); setIsActionModalOpen(true); }
          else if (sig === 'open') { setSelectedFile(file); handleModalAction('open'); }
        }} />
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