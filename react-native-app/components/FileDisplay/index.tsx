import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

interface FileItemProps {
  file: {
    id: string;
    name: string;
    modified: string;
    fileType: 'doc' | 'pdf' | 'folder';
  };
  onPress?: () => void;
  onMorePress?: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onPress, onMorePress }) => {
  // ... (getIconName ו-getIconColor ללא שינוי)

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* ... (אזור האייקון והשם ללא שינוי) */}
      <View style={styles.textContainer}>
        <Text style={styles.fileName}>{file.name}</Text>
        {/* שינוי הטקסט והוספת הנקודה */}
        <Text style={styles.fileInfo}>
          You opened {'\u2022'} {file.modified}
        </Text>
      </View>
      {/* כפתור שלוש נקודות בתוך ריבוע אפור */}
      <Pressable style={styles.moreButton} onPress={onMorePress}>
        <Ionicons name="ellipsis-vertical" size={20} color="#5F6368" />
      </Pressable>
    </Pressable>
  );
};

export default FileItem;