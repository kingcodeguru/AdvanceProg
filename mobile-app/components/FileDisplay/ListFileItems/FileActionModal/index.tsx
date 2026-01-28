import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated, 
  Dimensions
} from 'react-native';
import { styles } from './styles';

// 1. Import Theme Hook
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

import { getRole, getFileById } from '@/utilities/api'; 

// --- Images ---
const ICON_OPEN = require('@/assets/images/open_icon.png');
const ICON_DOWNLOAD = require('@/assets/images/download_icon.png');
const ICON_RENAME = require('@/assets/images/rename_icon.png');
const ICON_SHARE = require('@/assets/images/share_person_icon.png');
const ICON_LINK = require('@/assets/images/link_icon.png');
const ICON_MOVE = require('@/assets/images/move_folder_icon.png');
const ICON_STAR_ADD = require('@/assets/images/star_outline.png');
const ICON_STAR_REMOVE = require('@/assets/images/star_filled.png');
const ICON_DELETE = require('@/assets/images/remove_icon.png');
const ICON_RESTORE = require('@/assets/images/restore_icon.png');

const ICON_DOC = require('@/assets/images/docs_logo.png');
const ICON_IMG = require('@/assets/images/picture_logo.png');
const ICON_DIR = require('@/assets/images/dir_logo.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const can_view = (role: number) => role >= 1;
const can_edit = (role: number) => role >= 2;
const can_change_permissions = (role: number) => role >= 2;

interface FileActionModalProps {
  visible: boolean;
  fileID: string;
  fileName: string; 
  fileType: string; 
  onClose: () => void;
  onAction: (actionName: string) => void;
  isStarred: boolean;
  isTrashed?: boolean;
}

const FileActionModal = ({ 
  visible, 
  fileID, 
  fileName,
  fileType,
  onClose, 
  onAction, 
  isStarred, 
  isTrashed 
}: FileActionModalProps) => {

  // 2. Get Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [roles, setRoles] = useState({
    fileRole: 0,
    parentRole: 0,
    isLoading: true 
  });

  useEffect(() => {
    if (visible && fileID) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12
      }).start();

      setRoles(prev => ({ ...prev, isLoading: true }));
      let isMounted = true;

      const fetchData = async () => {
        try {
          const fRole = await getRole(fileID);
          
          let pId = "";
          try {
            const fileDataRes = await getFileById(fileID);
            const fileData = fileDataRes.json ? await fileDataRes.json() : fileDataRes;
            pId = fileData.parent_id || (fileData.ok ? (await fileData.json()).parent_id : "");
          } catch (e) { console.log("Parent check error", e); }

          let pRole = 0;
          if (pId && pId !== 'root') {
             try { pRole = await getRole(pId); } catch(e) {}
          } else {
             pRole = 2; 
          }

          if (isMounted) {
            setRoles({
              fileRole: fRole || 0,
              parentRole: pRole || 0,
              isLoading: false
            });
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
          if (isMounted) setRoles(prev => ({ ...prev, isLoading: false }));
        }
      };
      
      fetchData();
      return () => { isMounted = false; };

    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, fileID]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onClose(); 
    });
  };

  const handleItemClick = (action: string) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onAction(action);
      onClose();
    });
  };

  const getHeaderIcon = () => {
    switch (fileType) {
        case 'image': return ICON_IMG;
        case 'directory': return ICON_DIR;
        default: return ICON_DOC;
    }
  };

  const { fileRole, parentRole, isLoading } = roles;

  // Helper for consistent icon style (tinting for dark mode)
  const iconStyle = [styles.menuItemIcon, { tintColor: theme.textSecondary }];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose} 
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer, 
                { backgroundColor: theme.bgForm, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={[styles.dragHandle, { backgroundColor: theme.borderSubtle }]} />

              <View style={styles.headerContainer}>
                 <Image source={getHeaderIcon()} style={styles.headerIcon} />
                 <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
                    {fileName}
                 </Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color={theme.brandBlue} />
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.contentScroll}>
                  
                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('open')}>
                      <Image source={ICON_OPEN} style={iconStyle} />
                      <Text style={[styles.menuItemText, { color: theme.textMain }]}>Open</Text>
                    </TouchableOpacity>
                  )}

                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('download')}>
                      <Image source={ICON_DOWNLOAD} style={iconStyle} />
                      <Text style={[styles.menuItemText, { color: theme.textMain }]}>Download</Text>
                    </TouchableOpacity>
                  )}

                  {can_edit(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('rename')}>
                      <Image source={ICON_RENAME} style={iconStyle} />
                      <Text style={[styles.menuItemText, { color: theme.textMain }]}>Rename</Text>
                    </TouchableOpacity>
                  )}

                  <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                  {can_change_permissions(fileRole) && (
                    <>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('share_file')}>
                            <Image source={ICON_SHARE} style={iconStyle} />
                            <Text style={[styles.menuItemText, { color: theme.textMain }]}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('copy_link')}>
                            <Image source={ICON_LINK} style={iconStyle} />
                            <Text style={[styles.menuItemText, { color: theme.textMain }]}>Copy link</Text>
                        </TouchableOpacity>
                    </>
                  )}

                  <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                  {can_edit(fileRole) && can_edit(parentRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('move')}>
                      <Image source={ICON_MOVE} style={iconStyle} />
                      <Text style={[styles.menuItemText, { color: theme.textMain }]}>Move</Text>
                    </TouchableOpacity>
                  )}

                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick(isStarred ? 'remove_star' : 'add_star')}>
                      <Image 
                        source={isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD} 
                        // Specific logic for Star: If filled, maybe use brand color, otherwise text color
                        style={[
                            isStarred ? styles.menuItemIcon : styles.emptyStarIcon, 
                            { tintColor: isStarred ? theme.brandBlue : theme.textSecondary }
                        ]} 
                      />
                      <Text style={[styles.menuItemText, { color: theme.textMain }]}>
                          {isStarred ? "Remove from starred" : "Add to starred"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                  {can_edit(fileRole) && (
                     <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('delete')}>
                        <Image source={ICON_DELETE} style={iconStyle} />
                        <Text style={[styles.menuItemText, { color: theme.textMain }]}>Remove</Text>
                     </TouchableOpacity>
                  )}

                  {can_edit(fileRole) && isTrashed && (
                     <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('restore')}>
                        <Image source={ICON_RESTORE} style={iconStyle} />
                        <Text style={[styles.menuItemText, { color: theme.textMain }]}>Restore</Text>
                     </TouchableOpacity>
                  )}
                  
                </ScrollView>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FileActionModal;