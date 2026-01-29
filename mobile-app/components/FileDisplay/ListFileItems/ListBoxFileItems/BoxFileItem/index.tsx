import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { styles } from './styles';
import FilePreview from '../FilePreview';

import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

const DOC_ICON = require('@/assets/images/docs_logo.png');
const PIC_ICON = require('@/assets/images/picture_logo.png');
const DIR_ICON = require('@/assets/images/dir_logo.png');

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

interface BoxFileItemProps {
  fileData: FileData;
  showFooter?: boolean;
  onPress: () => void;      
  onMenuPress: () => void;  
}

const BoxFileItem = ({ fileData, showFooter = true, onPress, onMenuPress }: BoxFileItemProps) => {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const { name, type } = fileData;

  const getSmallIcon = () => {
    switch(type) {
      case 'text': return DOC_ICON;
      case 'image': return PIC_ICON;
      case 'directory': return DIR_ICON; 
      default: return DOC_ICON;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <TouchableWithoutFeedback onPress={onPress} onLongPress={onMenuPress}>
        <View style={[
            styles.cardContainer, 
            { 
              backgroundColor: theme.bgForm,
              borderColor: theme.borderSubtle 
            }
        ]}>
          <View style={[styles.previewArea, { backgroundColor: isDarkMode ? '#2d2f31' : '#f1f3f4' }]}>
             <FilePreview type={type} />
          </View>

          <View style={[styles.footerArea, { backgroundColor: isDarkMode ? '#2d2f31' : '#f1f3f4' }]}>
            <Image source={getSmallIcon()} style={styles.smallTypeIcon} />
            <View style={styles.fileTitleContainer}>
               <Text 
                 style={[styles.fileTitle, { color: theme.textMain }]} 
                 numberOfLines={1}
               >
                 {name}
               </Text>
            </View>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.bgForm }]} 
              onPress={onMenuPress}
              activeOpacity={0.6}
            >
              <Text style={[styles.actionMenuText, { color: theme.textSecondary }]}>...</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default BoxFileItem;