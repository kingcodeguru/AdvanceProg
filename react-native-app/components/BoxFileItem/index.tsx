import React from 'react';
import { View, Text, Image, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native';
import { styles } from './styles';
import FilePreview from '../FilePreview'; // הייבוא של הרכיב הקודם שעשינו

// תמונות אייקונים (תוודאי שהנתיבים נכונים אצלך)
const DOC_ICON = require('../../assets/images/docs_logo.png');
const PIC_ICON = require('../../assets/images/picture_logo.png');
const DIR_ICON = require('../../assets/images/dir_logo.png');
const MENU_ICON = require('../../assets/images/menu_dots.png'); // תמונה של 3 נקודות
// const DEFAULT_AVATAR = require('../../assets/images/default_avatar.png'); // אופציונלי

interface FileData {
  fid: string;
  name: string;
  type: string;
  starred?: boolean;
  last_modified?: string | number;
  owner_avatar?: string;
  trashed?: boolean;
}

interface BoxFileItemProps {
  fileData: FileData;
  showFooter?: boolean;
  onPress: () => void;       // לחיצה על הכרטיס (פתיחה)
  onMenuPress: () => void;   // לחיצה על 3 נקודות (פתיחת תפריט)
}

const BoxFileItem = ({ fileData, showFooter = true, onPress, onMenuPress }: BoxFileItemProps) => {
  const { name, type, last_modified, owner_avatar } = fileData;

  // בחירת האייקון הקטן למעלה
  const getIcon = () => {
    switch (type) {
      case 'text':
      case 'txt': return DOC_ICON;
      case 'image':
      case 'img': return PIC_ICON;
      case 'directory':
      case 'folder': return DIR_ICON;
      default: return DOC_ICON;
    }
  };

  // פירמוט תאריך פשוט
  const formatDate = (dateVal?: string | number) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    return d.toLocaleDateString();
  };

  // רכיב הלחיצה (באנדרואיד יש אפקט גל, באייפון רק שקיפות)
  const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  return (
    <View style={styles.boxFileWrapper}>
      <Touchable onPress={onPress} useForeground>
        <View style={styles.customCardContainer}>
          
          {/* --- Header --- */}
          <View style={styles.cardHeaderArea}>
            <View style={styles.headerContent}>
              <Image source={getIcon()} style={styles.fileIconSmall} />
              <Text style={styles.fileTitle} numberOfLines={1} ellipsizeMode="tail">
                {name}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={(e) => {
                 // חשוב: מונע מהלחיצה לעבור לכרטיס עצמו
                 e.stopPropagation && e.stopPropagation();
                 onMenuPress(); 
              }}
            >
              {/* אייקון 3 נקודות (תמונה) או טקסט */}
              {/* <Text style={{fontSize: 20, color: '#5f6368'}}>⋮</Text> */}
              <Image source={MENU_ICON} style={styles.actionIconImage} />
            </TouchableOpacity>
          </View>

          {/* --- Preview Image --- */}
          <View style={styles.imageContainer}>
            {/* משתמשים ב-FilePreview שיצרנו קודם */}
            <FilePreview type={type} />
          </View>

          {/* --- Footer (Optional) --- */}
          {showFooter && (
            <View style={styles.cardFooterArea}>
              {owner_avatar && (
                <Image 
                  source={{ uri: owner_avatar }} 
                  style={styles.userImgFooter} 
                />
              )}
              <Text style={styles.footerText} numberOfLines={1}>
                Opened • {formatDate(last_modified)}
              </Text>
            </View>
          )}

        </View>
      </Touchable>
    </View>
  );
};

export default BoxFileItem;