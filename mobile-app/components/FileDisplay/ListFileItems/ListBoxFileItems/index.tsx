import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';
import BoxFileItem from './BoxFileItem'; 

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

interface ListBoxFileItemsProps {
  files: FileData[] | null | undefined;
  showFooter?: boolean;
  onAction: (actionName: string, file: FileData) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const ListBoxFileItems = ({ files, showFooter = true, onAction, onScroll }: ListBoxFileItemsProps) => {
  // 2. Get Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

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
        
        onScroll={onScroll}
        scrollEventThrottle={16}
        
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
            // Optional: Pass theme down if needed
          />
        )}
      />
    </View>
  );
};

export default ListBoxFileItems;