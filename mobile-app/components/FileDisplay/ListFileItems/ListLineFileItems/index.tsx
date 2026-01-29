import React from 'react';
import { View, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styles } from './styles';

import LineFileItem from './LineFileItem'; 

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
          />
        )}
      />
    </View>
  );
};

export default ListLineFileItems;