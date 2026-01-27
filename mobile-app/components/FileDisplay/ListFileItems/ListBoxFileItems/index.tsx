import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';
import BoxFileItem from './BoxFileItem'; 

const EMPTY_FOLDER_IMG = require('@/assets/images/empty_folder-removebg.png');

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
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

// 1. הוספתי את onScroll כאן ב-Destructuring
const ListBoxFileItems = ({ files, showFooter = true, onAction, onScroll }: ListBoxFileItemsProps) => {

  // פונקציה פנימית לרינדור מצב ריק בתוך ה-FlatList
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={EMPTY_FOLDER_IMG} 
        style={styles.emptyImage} 
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={files || []}
        // 2. חיבור ה-onScroll
        onScroll={onScroll}
        scrollEventThrottle={16}
        
        // 3. שימוש ב-ListEmptyComponent במקום return מוקדם
        // זה מבטיח שה-FlatList תמיד קיים וה-onScroll תמיד מחובר
        ListEmptyComponent={renderEmptyComponent}
        
        keyExtractor={(item) => item.fid}
        numColumns={2}
        contentContainerStyle={files && files.length > 0 ? styles.listContent : {flex: 1}}
        columnWrapperStyle={files && files.length > 0 ? styles.columnWrapper : undefined}
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