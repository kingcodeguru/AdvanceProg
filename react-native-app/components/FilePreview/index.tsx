import React from 'react';
import { Image, View } from 'react-native';
import { styles } from './styles';

// טעינת התמונות מראש (Pre-load)
// תוודאי שהשמות והנתיבים תואמים לקבצים אצלך!
const TEXT_IMG = require('../../assets/images/Liel-Text.png');
const FOLDER_IMG = require('../../assets/images/Tamar-Folder.png');
const IMAGE_IMG = require('../../assets/images/Orel-Image.png');
// הוספתי דיפולט למקרה שיגיע טייפ לא מוכר
const DEFAULT_IMG = require('../../assets/images/Liel-Text.png'); 

interface FilePreviewProps {
  type: string;
}

const FilePreview = ({ type }: FilePreviewProps) => {
  
  // פונקציה פשוטה שבוחרת את התמונה לפי הטייפ
  const getImageSource = () => {
    switch (type) {
      case 'image':
      case 'img': // למקרה שזה מגיע ככה מהשרת
        return IMAGE_IMG;
      case 'directory':
      case 'dir':
      case 'folder':
        return FOLDER_IMG;
      case 'text':
      case 'txt':
        return TEXT_IMG;
      default:
        return DEFAULT_IMG;
    }
  };

  return (
    <Image 
      source={getImageSource()} 
      style={styles.previewImage}
      resizeMode="cover" // זה המקביל ל-object-fit: cover ב-CSS
    />
  );
};

export default FilePreview;