import React from 'react';
import { View, FlatList, Image } from 'react-native';
import { styles } from './styles';

// ייבוא הקומפוננטה הפנימית
import BoxFileItem from './BoxFileItem'; 

// תמונת "תיקייה ריקה"
const EMPTY_FOLDER_IMG = require('../../assets/images/empty_folder-removebg.png');

interface FileData {
  fid: string;
  name: string;
  type: string;
  starred: boolean;
  last_modified: string | number;
  owner_avatar?: string | null;
  previewUrl?: string | null;
  trashed?: boolean;
}

interface ListBoxFileItemsProps {
  files: FileData[] | null | undefined;
  showFooter?: boolean;
  onAction: (actionName: string, file: FileData) => void;
}

const ListBoxFileItems = ({ files, showFooter = true, onAction }: ListBoxFileItemsProps) => {

  // --- מצב 1: אין קבצים (Empty State) ---
  if (!files || files.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image 
          source={EMPTY_FOLDER_IMG} 
          style={styles.emptyImage} 
          resizeMode="contain"
        />
        {/* מחקנו את הטקסט No files found */}
      </View>
    );
  }

  // --- מצב 2: יש קבצים (Grid List) ---
  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.fid}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BoxFileItem 
            fileData={item}
            showFooter={showFooter}
            onPress={() => onAction('open', item)}
            onMenuPress={() => onAction('menu', item)}
          />
        )}
      />
    </View>
  );
};

export default ListBoxFileItems;