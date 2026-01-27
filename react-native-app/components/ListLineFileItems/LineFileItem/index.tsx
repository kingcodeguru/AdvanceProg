import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { styles } from './styles';

const DOC_ICON = require('../../../assets/images/docs_logo.png');
const PIC_ICON = require('../../../assets/images/picture_logo.png');
const DIR_ICON = require('../../../assets/images/dir_logo.png');

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

interface LineFileItemProps {
  fileData: FileData;
  onPress: () => void;      
  onMenuPress: () => void;  
}

const LineFileItem = ({ fileData, onPress, onMenuPress }: LineFileItemProps) => {
  const { name, type, last_modified } = fileData;

  const getIcon = () => {
    switch(type) {
      case 'text': return DOC_ICON;
      case 'image': return PIC_ICON;
      case 'directory': return DIR_ICON;
      default: return DOC_ICON;
    }
  };

  const dateObj = new Date(last_modified);
  const dateString = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onPress} onLongPress={onMenuPress}>
        <View style={styles.rowContainer}>
          
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image source={getIcon()} style={styles.fileIcon} />
          </View>

          {/* Text Info */}
          <View style={styles.textContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.fileDetails} numberOfLines={1}>
              You opened • {dateString}
            </Text>
          </View>

          {/* Menu Dots */}
          <TouchableOpacity 
            style={styles.menuBtn} 
            onPress={onMenuPress}
            activeOpacity={0.6}
          >
            <Text style={styles.menuText}>...</Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default LineFileItem;