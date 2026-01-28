import React, { useEffect, useState, useRef } from 'react';
import { 
  Modal, View, Text, TouchableOpacity, Image, ScrollView, 
  ActivityIndicator, TouchableWithoutFeedback, Animated, Dimensions
} from 'react-native';
import { styles } from './styles';

// Logic Imports
import { getRole, getFileById } from '@/utilities/api'; 
import { can_view, can_edit, can_change_permissions } from '@/utilities/roles';

// 1. Theme Imports
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Icons ---
const ICON_OPEN = require('@/assets/images/open_icon.png');
const ICON_DOWNLOAD = require('@/assets/images/download_icon.png');
const ICON_RENAME = require('@/assets/images/rename_icon.png');
const ICON_SHARE = require('@/assets/images/share_person_icon.png');
const ICON_SEND_COPY = require('@/assets/images/link_icon.png'); 
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
  visible, fileID, fileName, fileType, onClose, onAction, isStarred, isTrashed 
}: FileActionModalProps) => {

  // 2. Get Current Theme
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [roles, setRoles] = useState({ fileRole: 0, parentRole: 0, isLoading: true });

  useEffect(() => {
    if (visible && fileID) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 12 }).start();
      fetchData();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, fileID]);

  const fetchData = async () => {
    try {
      setRoles(prev => ({ ...prev, isLoading: true }));
      const fRole = await getRole(fileID);
      let pRole = 2; 
      try {
        const response = await getFileById(fileID);
        const fileData = response.json ? await response.json() : response;
        if (fileData?.parent_id && fileData.parent_id !== 'root') {
          pRole = await getRole(fileData.parent_id);
        }
      } catch (e) { console.log("Parent fetch error", e); }
      setRoles({ fileRole: fRole ?? 0, parentRole: pRole ?? 2, isLoading: false });
    } catch (error) {
      setRoles(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }).start(onClose);
  };

  const handleItemClick = (action: string) => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }).start(() => {
      onAction(action);
      onClose(); 
    });
  };

  const { fileRole, parentRole, isLoading } = roles;

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
        { id: 'send_copy', label: 'Send a copy', icon: ICON_SEND_COPY, show: can_view(fileRole) },
      ]
    },
    {
      id: 'organize',
      items: [
        { id: 'move', label: 'Move', icon: ICON_MOVE, show: can_edit(fileRole) && can_edit(parentRole) },
        { 
          id: 'toggle_star', 
          label: isStarred ? "Remove from starred" : "Add to starred", 
          icon: isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD, 
          show: can_view(fileRole) 
        },
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
                // 3. Dynamic Background Color
                { 
                  backgroundColor: theme.bgForm,
                  transform: [{ translateY: slideAnim }], 
                  maxHeight: SCREEN_HEIGHT * 0.5 
                }
              ]}
            >
              {/* Dynamic Drag Handle */}
              <View style={[styles.dragHandle, { backgroundColor: theme.borderSubtle }]} />
              
              <View style={styles.headerContainer}>
                {/* Header Icon usually stays original color (Docs/Images), no tint needed */}
                
                <Image 
                  source={fileType === 'image' ? ICON_IMG : fileType === 'directory' ? ICON_DIR : ICON_DOC} 
                  style={styles.headerIcon} 
                />
                <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
                  {fileName}
                </Text>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.brandBlue} />
                </View>
              ) : (
                <ScrollView bounces={false} style={{ flexGrow: 0 }}>
                  {visibleSections.map((section, index) => (
                    <React.Fragment key={section.id}>
                      {section.items.map(item => {
                        
                        // 4. Determine Icon Tint
                        // If it is the 'Filled Star', use Brand Blue.
                        // Otherwise (including 'Outline Star' and other icons), use Secondary Text color.
                        const isFilledStar = item.id === 'toggle_star' && isStarred;
                        const iconTint = isFilledStar ? theme.brandBlue : theme.textSecondary;

                        return (
                          <TouchableOpacity 
                            key={item.id} 
                            style={styles.menuItem} 
                            onPress={() => handleItemClick(item.id)}
                          >
                            <Image 
                              source={item.icon} 
                              style={[styles.menuItemIcon, { tintColor: iconTint }]} 
                            />
                            <Text style={[styles.menuItemText, { color: theme.textMain }]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      
                      {/* Dynamic Divider */}
                      {index < visibleSections.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
                      )}
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