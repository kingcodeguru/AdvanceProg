import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, View, Text, TouchableOpacity, Image, ScrollView, 
  ActivityIndicator, TouchableWithoutFeedback, Animated, Dimensions
} from 'react-native';
import { styles } from './styles';

// --- ייבוא לוגיקת התפקידים וה-API ---
import { getRole, getFileById } from '@/utilities/api'; 
import { can_view, can_edit, can_change_permissions } from '@/utilities/roles'; // גישה עם שטורדל

// --- תמונות ואייקונים ---
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
  visible, fileID, fileName, fileType, onClose, onAction, isStarred, isTrashed 
}: FileActionModalProps) => {

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [roles, setRoles] = useState({ fileRole: 0, parentRole: 0, isLoading: true });

  useEffect(() => {
    if (visible && fileID) {
      // אנימציית כניסה
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12
      }).start();

      let isMounted = true;
      const fetchData = async () => {
        try {
          setRoles(prev => ({ ...prev, isLoading: true }));
          
          // קבלת תפקיד המשתמש בקובץ
          const fRole = await getRole(fileID);
          
          // קבלת ה-parent_id ובדיקת הרשאות עליו
          let pRole = 2; // דיפולט ל-Root
          try {
            const response = await getFileById(fileID);
            const fileData = response.json ? await response.json() : response;
            const pId = fileData?.parent_id;

            if (pId && pId !== 'root') {
              pRole = await getRole(pId);
            }
          } catch (e) { console.log("Parent fetch failed", e); }

          if (isMounted) {
            setRoles({
              fileRole: fRole ?? 0,
              parentRole: pRole ?? 0,
              isLoading: false
            });
          }
        } catch (error) {
          console.error("Roles fetch error:", error);
          if (isMounted) setRoles(prev => ({ ...prev, isLoading: false }));
        }
      };
      
      fetchData();
      return () => { isMounted = false; };
    }
  }, [visible, fileID]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true
    }).start(onClose);
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

  const { fileRole, parentRole, isLoading } = roles;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.dragHandle} />

              <View style={styles.headerContainer}>
                 <Image source={fileType === 'image' ? ICON_IMG : fileType === 'directory' ? ICON_DIR : ICON_DOC} style={styles.headerIcon} />
                 <Text style={styles.headerTitle} numberOfLines={1}>{fileName}</Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1a73e8" /></View>
              ) : (
                <ScrollView contentContainerStyle={styles.contentScroll}>
                  
                  {/* לוגיקת הצגת כפתורים לפי Roles.js המשותף */}
                  {can_view(fileRole) && (
                    <>
                      <MenuOption label="Open" icon={ICON_OPEN} onPress={() => handleItemClick('open')} />
                      <MenuOption label="Download" icon={ICON_DOWNLOAD} onPress={() => handleItemClick('download')} />
                    </>
                  )}

                  {can_edit(fileRole) && (
                    <MenuOption label="Rename" icon={ICON_RENAME} onPress={() => handleItemClick('rename')} />
                  )}

                  <View style={styles.divider} />

                  {can_change_permissions(fileRole) && (
                    <>
                      <MenuOption label="Share" icon={ICON_SHARE} onPress={() => handleItemClick('share_file')} />
                      <MenuOption label="Copy link" icon={ICON_LINK} onPress={() => handleItemClick('copy_link')} />
                    </>
                  )}

                  <View style={styles.divider} />

                  {can_edit(fileRole) && can_edit(parentRole) && (
                    <MenuOption label="Move" icon={ICON_MOVE} onPress={() => handleItemClick('move')} />
                  )}

                  {can_view(fileRole) && (
                    <MenuOption 
                      label={isStarred ? "Remove from starred" : "Add to starred"} 
                      icon={isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD} 
                      onPress={() => handleItemClick(isStarred ? 'remove_star' : 'add_star')} 
                    />
                  )}

                  <View style={styles.divider} />

                  {can_edit(fileRole) && (
                    <MenuOption label="Remove" icon={ICON_DELETE} onPress={() => handleItemClick('delete')} />
                  )}

                  {isTrashed && can_edit(fileRole) && (
                    <MenuOption label="Restore" icon={ICON_RESTORE} onPress={() => handleItemClick('restore')} />
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

// קומפוננטת עזר פנימית לסדר בעיניים
const MenuOption = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Image source={icon} style={styles.menuItemIcon} />
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

export default FileActionModal;