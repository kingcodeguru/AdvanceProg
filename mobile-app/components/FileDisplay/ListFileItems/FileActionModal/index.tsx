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
  Dimensions,
  StyleSheet
} from 'react-native';
import { styles } from './styles';

// חיבור ללוגיקת הפרויקט המאוחדת
import { getRole, getFileById } from '@/utilities/api'; 
import { can_view, can_edit, can_change_permissions } from '@/utilities/roles';

// --- הגדרת גובה המסך לאנימציה ---
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- ייבוא אייקונים (ודאו שהנתיבים תואמים למבנה התיקיות שלכם) ---
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

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [roles, setRoles] = useState({
    fileRole: 0,
    parentRole: 0,
    isLoading: true 
  });

  useEffect(() => {
    if (visible && fileID) {
      // אנימציה קפיצית ומהירה לכניסה
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12
      }).start();

      fetchData();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, fileID]);

  const fetchData = async () => {
    try {
      setRoles(prev => ({ ...prev, isLoading: true }));
      
      // שליפת תפקיד הקובץ מה-API של הפרויקט
      const fRole = await getRole(fileID);
      
      let pRole = 2; // ברירת מחדל ל-Root/Admin
      try {
        const response = await getFileById(fileID);
        const fileData = response.json ? await response.json() : response;
        const pId = fileData?.parent_id;

        if (pId && pId !== 'root') {
          pRole = await getRole(pId);
        }
      } catch (e) {
        console.log("Error checking parent role", e);
      }

      setRoles({
        fileRole: fRole ?? 0,
        parentRole: pRole ?? 2,
        isLoading: false
      });
    } catch (error) {
      console.error("Fetch roles failed:", error);
      setRoles(prev => ({ ...prev, isLoading: false }));
    }
  };

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

  // --- ארגון התפריט לקבוצות לוגיות (בדומה לגרסת ה-Web) ---
  const sections = [
    {
      id: 'actions',
      items: [
        { id: 'open', label: 'Open', icon: ICON_OPEN, show: can_view(fileRole) },
        { id: 'download', label: 'Download', icon: ICON_DOWNLOAD, show: can_view(fileRole) },
        { id: 'rename', label: 'Rename', icon: ICON_RENAME, show: can_edit(fileRole) },
      ]
    },
    {
      id: 'share',
      items: [
        { id: 'share_file', label: 'Share', icon: ICON_SHARE, show: can_change_permissions(fileRole) },
        { id: 'copy_link', label: 'Copy link', icon: ICON_LINK, show: can_change_permissions(fileRole) },
      ]
    },
    {
      id: 'organize',
      items: [
        { id: 'move', label: 'Move', icon: ICON_MOVE, show: can_edit(fileRole) && can_edit(parentRole) },
        { id: 'star', label: isStarred ? "Remove from starred" : "Add to starred", icon: isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD, show: can_view(fileRole) },
      ]
    },
    {
      id: 'danger',
      items: [
        { id: 'delete', label: 'Remove', icon: ICON_DELETE, show: can_edit(fileRole) },
        { id: 'restore', label: 'Restore', icon: ICON_RESTORE, show: !!isTrashed && can_edit(fileRole) },
      ]
    }
  ];

  // סינון קבוצות ריקות כדי למנוע מפרידים מיותרים
  const visibleSections = sections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => item.show)
  })).filter(sec => sec.items.length > 0);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer, 
                { 
                  transform: [{ translateY: slideAnim }],
                  maxHeight: SCREEN_HEIGHT * 0.5 // התפריט יתכווץ לפי התוכן
                }
              ]}
            >
              <View style={styles.dragHandle} />

              <View style={styles.headerContainer}>
                <Image 
                  source={fileType === 'image' ? ICON_IMG : fileType === 'directory' ? ICON_DIR : ICON_DOC} 
                  style={styles.headerIcon} 
                />
                <Text style={styles.headerTitle} numberOfLines={1}>{fileName}</Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1a73e8" />
                </View>
              ) : (
                <ScrollView bounces={false} style={{ flexGrow: 0 }}>
                  {visibleSections.map((section, index) => (
                    <React.Fragment key={section.id}>
                      {section.items.map(item => (
                        <TouchableOpacity 
                          key={item.id} 
                          style={styles.menuItem} 
                          onPress={() => handleItemClick(item.id)}
                        >
                          <Image source={item.icon} style={styles.menuItemIcon} />
                          <Text style={styles.menuItemText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                      {/* מפריד רק אם יש קבוצה נוספת בהמשך */}
                      {index < visibleSections.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))}
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