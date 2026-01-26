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

// חיבור לשרת
import { getRole, getFileById } from '@/utilities/api'; 
// שימי לב: אם הנתיב אצלך הוא לא @, תשני ל- '../../utilities/api'

// --- תמונות ---
const ICON_OPEN = require('../../assets/images/open_icon.png');
const ICON_DOWNLOAD = require('../../assets/images/download_icon.png');
const ICON_RENAME = require('../../assets/images/rename_icon.png');
const ICON_SHARE = require('../../assets/images/share_person_icon.png');
const ICON_LINK = require('../../assets/images/link_icon.png');
const ICON_MOVE = require('../../assets/images/move_folder_icon.png');
const ICON_STAR_ADD = require('../../assets/images/star_outline.png');
const ICON_STAR_REMOVE = require('../../assets/images/star_filled.png');
const ICON_DELETE = require('../../assets/images/remove_icon.png');
const ICON_RESTORE = require('../../assets/images/restore_icon.png');

const ICON_DOC = require('../../assets/images/docs_logo.png');
const ICON_IMG = require('../../assets/images/picture_logo.png');
const ICON_DIR = require('../../assets/images/dir_logo.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Helpers ---
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

  // משתנה לאנימציה של הגלישה (מתחיל מחוץ למסך למטה)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [roles, setRoles] = useState({
    fileRole: 0,
    parentRole: 0,
    isLoading: true 
  });

  // --- לוגיקה אמיתית (שרת + אנימציה) ---
  useEffect(() => {
    if (visible && fileID) {
      
      // 1. התחלת אנימציה (במקביל לטעינה)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12
      }).start();

      // 2. התחלת טעינת נתונים
      setRoles(prev => ({ ...prev, isLoading: true }));
      let isMounted = true;

      const fetchData = async () => {
        try {
          // בדיקת הרשאה לקובץ הנוכחי
          const fRole = await getRole(fileID);
          
          // בדיקת הרשאה לאבא (בשביל כפתור Move)
          let pId = "";
          try {
            const fileDataRes = await getFileById(fileID);
            // טיפול בתשובה (תלוי איך ה-API שלך בנוי, לפעמים צריך .json())
            const fileData = fileDataRes.json ? await fileDataRes.json() : fileDataRes;
            pId = fileData.parent_id || (fileData.ok ? (await fileData.json()).parent_id : "");
          } catch (e) { console.log("Parent check error", e); }

          let pRole = 0;
          if (pId && pId !== 'root') {
             try { pRole = await getRole(pId); } catch(e) {}
          } else {
             pRole = 2; // ל-root בדרך כלל יש הרשאה
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
      // כשהמודל סגור, מאפסים את המיקום למטה
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, fileID]);

  // פונקציה לסגירה "חלקה" - קודם אנימציה למטה, ואז סגירה אמיתית
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT, // יורד למטה
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

  return (
    <Modal
      animationType="fade" // רקע שחור דוהה
      transparent={true}
      visible={visible}
      onRequestClose={handleClose} 
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          
          <TouchableWithoutFeedback>
            {/* הקופסה הלבנה מחליקה למעלה */}
            <Animated.View 
              style={[
                styles.modalContainer, 
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.dragHandle} />

              <View style={styles.headerContainer}>
                 <Image source={getHeaderIcon()} style={styles.headerIcon} />
                 <Text style={styles.headerTitle} numberOfLines={1}>{fileName}</Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#1a73e8" />
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.contentScroll}>
                  
                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('open')}>
                      <Image source={ICON_OPEN} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Open</Text>
                    </TouchableOpacity>
                  )}

                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('download')}>
                      <Image source={ICON_DOWNLOAD} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Download</Text>
                    </TouchableOpacity>
                  )}

                  {can_edit(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('rename')}>
                      <Image source={ICON_RENAME} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Rename</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  {can_change_permissions(fileRole) && (
                    <>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('share_file')}>
                            <Image source={ICON_SHARE} style={styles.menuItemIcon} />
                            <Text style={styles.menuItemText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('copy_link')}>
                            <Image source={ICON_LINK} style={styles.menuItemIcon} />
                            <Text style={styles.menuItemText}>Copy link</Text>
                        </TouchableOpacity>
                    </>
                  )}

                  <View style={styles.divider} />

                  {can_edit(fileRole) && can_edit(parentRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('move')}>
                      <Image source={ICON_MOVE} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Move</Text>
                    </TouchableOpacity>
                  )}

                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick(isStarred ? 'remove_star' : 'add_star')}>
                      <Image 
                        source={isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD} 
                        style={isStarred ? styles.menuItemIcon : styles.emptyStarIcon} 
                      />
                      <Text style={styles.menuItemText}>
                          {isStarred ? "Remove from starred" : "Add to starred"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  {can_edit(fileRole) && (
                     <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('delete')}>
                        <Image source={ICON_DELETE} style={styles.menuItemIcon} />
                        <Text style={styles.menuItemText}>Remove</Text>
                     </TouchableOpacity>
                  )}

                  {can_edit(fileRole) && isTrashed && (
                     <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('restore')}>
                        <Image source={ICON_RESTORE} style={styles.menuItemIcon} />
                        <Text style={styles.menuItemText}>Restore</Text>
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