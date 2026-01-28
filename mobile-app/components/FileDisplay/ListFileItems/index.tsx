import React, { useState } from 'react';
import { View, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Imports
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

// API
import { patchFile, deleteFile, setStar, getFileById } from '@/utilities/api';

// Components
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

  // === CORE ACTIONS LOGIC (המוח של הקומפוננטה) ===
  
  const performFileAction = async (action: string, file: any) => {
    if (!file) return;

    switch (action) {
      case 'open':
        // פתיחה מיידית - בלי לחכות ל-State!
        const path = file.type === 'directory' ? 'directories' : (file.type === 'image' ? 'images' : 'files');
        router.push(`/drive/${path}/${file.fid}` as any);
        break;

      case 'toggle_star':
        // לוגיקה חכמה: הופך את המצב הקיים
        try {
          const response = await setStar(file.fid, !file.starred);
          if (response.ok && onRefresh) onRefresh();
        } catch (e) { console.error(e); }
        break;

      case 'rename':
        setSelectedFile(file); // כאן חייבים State למודאל
        setIsRenameModalOpen(true);
        break;

      case 'move':
        setSelectedFile(file);
        setIsMoveModalOpen(true);
        break;

      case 'delete':
        await handleDelete(file);
        break;

      case 'download':
        await handleDownload(file);
        break;
      
      case 'send_copy':
        await handleSendCopy(file);
        break;

      case 'restore':
        try {
          await patchFile(file.fid, { trashed: false });
          if (onRefresh) onRefresh();
        } catch (e) { console.error(e); }
        break;

      case 'share_file':
        router.push(`/drive/files/permissions/${file.fid}` as any);
        break;
        
      case 'menu':
        // פתיחת התפריט בלבד
        setSelectedFile(file);
        setIsActionModalOpen(true);
        break;
    }
  };


  // --- Helper Functions (לוגיקה מסובכת שהוצאנו החוצה) ---

  const handleDelete = async (file: any) => {
    const execute = async () => {
      try {
        const res = file.trashed ? await deleteFile(file.fid) : await patchFile(file.fid, { trashed: true });
        if (res.ok && onRefresh) onRefresh();
        else Alert.alert("Error", `Server Message: ${(await res.json()).error}`);
      } catch (e) { console.error(e); }
    };

    if (file.trashed) {
      Alert.alert("Delete Forever", "Cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: execute }
      ]);
    } else {
      await execute();
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const res = await getFileById(file.fid);
      if (!res.ok) return;
      const data = await res.json();
      
      let content = data.content;
      let encoding: any = 'utf8';
      const isImage = file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i);

      if (isImage) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }

      // שמירת תמונות
      if (isImage) {
        const localUri = `${FileSystem.cacheDirectory}${file.name}`;
        await FileSystem.writeAsStringAsync(localUri, content, { encoding });
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert("Success", "Saved to gallery!");
        } else {
          Alert.alert("Permission", "Gallery access needed.");
        }
        return;
      }

      // שמירת קבצים (Android SAF / iOS Share)
      if (Platform.OS === 'android') {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted) {
          const mime = getMimeType(file.name);
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(perm.directoryUri, file.name, mime);
          await FileSystem.writeAsStringAsync(uri, content, { encoding });
          Alert.alert("Success", "Saved!");
        }
      } else {
        const uri = `${FileSystem.documentDirectory}${file.name}`;
        await FileSystem.writeAsStringAsync(uri, content, { encoding });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      }
    } catch (e) { console.error(e); Alert.alert("Error", "Download failed"); }
  };

  const handleSendCopy = async (file: any) => {
    try {
      const res = await getFileById(file.fid);
      const data = await res.json();
      const uri = `${FileSystem.cacheDirectory}${file.name}`;
      
      let content = data.content;
      let encoding: any = 'utf8';
      if (file.type === 'image' || file.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        content = content.replace(/^data:image\/\w+;base64,/, "");
        encoding = 'base64';
      }
      
      await FileSystem.writeAsStringAsync(uri, content, { encoding });
      await Sharing.shareAsync(uri, { dialogTitle: `Send ${file.name}` });
    } catch (e) { console.error(e); }
  };

  const getMimeType = (filename: string) => {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    if (filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    return 'application/octet-stream';
  };

  // --- UI Render ---

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {/* הרשימה קוראת ישירות ל-performFileAction */}
      {viewMode === 'line' ? (
        <ListLineFileItems 
          files={files} 
          onAction={(action, file) => performFileAction(action, file)} 
          onScroll={onScroll} 
        />
      ) : (
        <ListBoxFileItems 
          files={files} 
          showFooter={showFooter} 
          onAction={(action, file) => performFileAction(action, file)} 
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
            onAction={(action) => {
              // המודאל סוגר את עצמו, ואז אנחנו מריצים את הפעולה
              setIsActionModalOpen(false);
              setTimeout(() => performFileAction(action, selectedFile), 300);
            }}
          />

          <RenameFileModal
            visible={isRenameModalOpen}
            fileName={selectedFile.name} 
            onClose={() => { setIsRenameModalOpen(false); setSelectedFile(null); }}
            onRename={async (newName) => {
              const res = await patchFile(selectedFile.fid, { name: newName });
              if (res.ok) { setIsRenameModalOpen(false); setSelectedFile(null); if (onRefresh) onRefresh(); }
            }}
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