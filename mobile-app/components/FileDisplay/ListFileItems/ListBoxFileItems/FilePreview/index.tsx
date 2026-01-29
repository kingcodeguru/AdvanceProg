import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const TEXT_IMG = require('@/assets/images/Liel-Text.png');
const FOLDER_IMG = require('@/assets/images/Tamar-Folder.png');
const IMAGE_IMG = require('@/assets/images/Orel-Image.png');
const DEFAULT_IMG = require('@/assets/images/Liel-Text.png'); 

interface FilePreviewProps {
  type: string;
}

const FilePreview = ({ type }: FilePreviewProps) => {
  
  const getImageSource = () => {
    switch (type) {
      case 'image':
      case 'img': 
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
    <View style={styles.container}>
      <Image 
        source={getImageSource()} 
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-start', 
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: undefined, 
    aspectRatio: 1,
    resizeMode: 'cover',
  },
});

export default FilePreview;