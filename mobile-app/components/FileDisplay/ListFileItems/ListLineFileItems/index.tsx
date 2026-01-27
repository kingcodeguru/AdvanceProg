import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';

// ייבוא השורה הבודדת
import LineFileItem from './LineFileItem'; 

// תמונת "תיקייה ריקה"
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

interface ListLineFileItemsProps {
  files: FileData[] | null | undefined;
  onAction: (actionName: string, file: FileData) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // הוספת ה-Prop
}

const ListLineFileItems = ({ files, onAction, onScroll }: ListLineFileItemsProps) => {

  // פונקציה פנימית לרינדור מצב ריק (Empty State) בתוך ה-FlatList
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
        keyExtractor={(item) => item.fid}
        
        // --- חיבור האנימציה של ה-FAB ---
        onScroll={onScroll}
        scrollEventThrottle={16} // מבטיח דגימת גלילה תכופה לאנימציה חלקה
        
        // --- טיפול במצב ריק ---
        ListEmptyComponent={renderEmptyComponent}
        
        // הגדרות עיצוב לרשימה
        contentContainerStyle={[
          styles.listContent,
          (!files || files.length === 0) && { flex: 1 } // מבטיח מרכוז כשהרשימה ריקה
        ]}
        showsVerticalScrollIndicator={false}
        
        renderItem={({ item }) => (
          <LineFileItem 
            fileData={item}
            onPress={() => onAction('open', item)}
            onMenuPress={() => onAction('menu', item)}
          />
        )}
      />
    </View>
  );
};

export default ListLineFileItems;