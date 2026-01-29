import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';
import BoxFileItem from './BoxFileItem'; 

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

  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const renderEmptyComponent = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.bgPrimary }]}>
      <Image 
        source={EMPTY_FOLDER_IMG} 
        style={styles.emptyImage} 
        resizeMode="contain"
      />
    </View>
  );

  return (
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
          />
        )}
      />
    </View>
  );
};

export default ListBoxFileItems;