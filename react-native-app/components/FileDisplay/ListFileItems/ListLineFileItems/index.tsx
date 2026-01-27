import React from 'react';
import { View, FlatList, Image } from 'react-native';
import { styles } from './styles';

// ייבוא השורה הבודדת (שעיצבנו בול כמו שרצית)
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
}

const ListLineFileItems = ({ files, onAction }: ListLineFileItemsProps) => {

  // --- מצב 1: אין קבצים (Empty State) ---
  if (!files || files.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image 
          source={EMPTY_FOLDER_IMG} 
          style={styles.emptyImage} 
          resizeMode="contain"
        />
        {/* בלי טקסט, כמו שביקשת */}
      </View>
    );
  }

  // --- מצב 2: רשימה (List) ---
  return (
    <View style={styles.container}>
      {/* במובייל אנחנו מוותרים על שורת הכותרת (Name/Date/Owner)
         כי זה תופס מקום והמידע כבר קיים בתוך כל שורה (LineFileItem).
         זה נותן את המראה הנקי של ה"בדיקה" שעשינו.
      */}
      <FlatList
        data={files}
        keyExtractor={(item) => item.fid}
        
        // הגדרות עיצוב לרשימה
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        renderItem={({ item }) => (
          <LineFileItem 
            fileData={item}
            
            // לחיצה רגילה -> פתיחה
            onPress={() => onAction('open', item)}
            
            // לחיצה על 3 נקודות -> תפריט
            onMenuPress={() => onAction('menu', item)}
          />
        )}
      />
    </View>
  );
};

export default ListLineFileItems;