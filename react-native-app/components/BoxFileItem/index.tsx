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

const DOC_ICON = require('../../assets/images/docs_logo.png');
const PIC_ICON = require('../../assets/images/picture_logo.png');
const DIR_ICON = require('../../assets/images/dir_logo.png');

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
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onPress} onLongPress={onMenuPress}>
        <View style={styles.cardContainer}>
          
          {/* --- Preview Area --- */}
          <View style={styles.previewArea}>
             {/* פשוט ונקי - בלי wrapper ובלי padding */}
             <FilePreview type={type} />
          </View>

          {/* --- Footer Area --- */}
          <View style={styles.footerArea}>
            <Image source={getSmallIcon()} style={styles.smallTypeIcon} />
            <View style={styles.fileTitleContainer}>
               <Text style={styles.fileTitle} numberOfLines={1}>{name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={onMenuPress}
              activeOpacity={0.6}
            >
              <Text style={styles.actionMenuText}>...</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default BoxFileItem;