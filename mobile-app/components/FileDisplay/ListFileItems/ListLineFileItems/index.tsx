import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';

// Import Single Item Component
import LineFileItem from './LineFileItem'; 

// 1. Import Theme Hook
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

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
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; 
}

const ListLineFileItems = ({ files, onAction, onScroll }: ListLineFileItemsProps) => {
  // 2. Get Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  // Render Empty State
  const renderEmptyComponent = () => (
    // Dynamic Background for Empty State
    <View style={[styles.emptyContainer, { backgroundColor: theme.bgPrimary }]}>
      <Image 
        source={EMPTY_FOLDER_IMG} 
        style={styles.emptyImage} 
        resizeMode="contain"
      />
    </View>
  );

  return (
    // Dynamic Background for Main Container
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <FlatList
        data={files || []}
        keyExtractor={(item) => item.fid}
        
        onScroll={onScroll}
        scrollEventThrottle={16} 
        
        ListEmptyComponent={renderEmptyComponent}
        
        contentContainerStyle={[
          styles.listContent,
          (!files || files.length === 0) && { flex: 1 } 
        ]}
        showsVerticalScrollIndicator={false}
        
        renderItem={({ item }) => (
          <LineFileItem 
            fileData={item}
            onPress={() => onAction('open', item)}
            onMenuPress={() => onAction('menu', item)}
            // Optional: You can pass the theme down if LineFileItem doesn't use the hook itself
            // theme={theme} 
          />
        )}
      />
    </View>
  );
};

export default ListLineFileItems;