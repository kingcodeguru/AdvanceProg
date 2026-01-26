import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  TouchableWithoutFeedback 
} from 'react-native';
import { styles } from './styles';

// פונקציות עזר (מהקבצים שלך)
import { can_change_permissions, can_edit, can_view } from '@/utilities/roles'; 
import { getRole, getFileById } from '@/utilities/api'; 

// --- תמונות אייקונים ---
// שימי לב: השתמשתי בשמות מקבצים שהיו לך בקוד ה-WEB, תוודאי שהם קיימים ב-assets/images
const ICON_OPEN = require('../../assets/images/open_icon.png'); // או להשתמש בלוגו של הקובץ
const ICON_DOWNLOAD = require('../../assets/images/download_icon.png');
const ICON_RENAME = require('../../assets/images/rename_icon.png');
const ICON_SHARE = require('../../assets/images/share_person_icon.png');
const ICON_LINK = require('../../assets/images/link_icon.png');
const ICON_MOVE = require('../../assets/images/move_folder_icon.png');
const ICON_STAR_ADD = require('../../assets/images/star_outline.png'); // צריך להוסיף אייקון כוכב ריק
const ICON_STAR_REMOVE = require('../../assets/images/star_filled.png'); // ואייקון כוכב מלא
const ICON_DELETE = require('../../assets/images/remove_icon.png');
const ICON_RESTORE = require('../../assets/images/restore_icon.png');

// אייקונים לטייפים (בשביל הכותרת)
const ICON_DOC = require('../../assets/images/docs_logo.png');
const ICON_IMG = require('../../assets/images/picture_logo.png');
const ICON_DIR = require('../../assets/images/dir_logo.png');


interface FileActionModalProps {
  visible: boolean;
  fileID: string;
  fileName: string; // הוספתי את זה כדי להציג בכותרת
  fileType: string; // הוספתי את זה כדי להציג אייקון בכותרת
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

  const [roles, setRoles] = useState({
    fileRole: 0,
    parentRole: 0,
    isLoading: true 
  });

  // --- Fetch Roles Logic (אותו לוגיקה כמו בווב) ---
  useEffect(() => {
    if (visible && fileID) {
      setRoles(prev => ({ ...prev, isLoading: true }));
      let isMounted = true;

      const fetchData = async () => {
        try {
          // 1. קבלת הרשאה לקובץ
          const fRole = await getRole(fileID);
          
          // 2. מציאת אבא וקבלת הרשאה לאבא (בשביל Move)
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
             pRole = 2; // ב-Root יש בדרך כלל הרשאות
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
    }
  }, [visible, fileID]);


  // Helper לבחירת אייקון כותרת
  const getHeaderIcon = () => {
    switch (fileType) {
        case 'image': return ICON_IMG;
        case 'directory': return ICON_DIR;
        default: return ICON_DOC;
    }
  };

  const handleItemClick = (action: string) => {
    onClose(); // סגור את המודל
    setTimeout(() => {
        onAction(action); // תפעיל את הפעולה
    }, 200);
  };

  const { fileRole, parentRole, isLoading } = roles;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // חובה לאנדרואיד (כפתור חזור)
    >
      {/* לחיצה על הרקע סוגרת את המודל */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          
          {/* מונע סגירה כשלוחצים על המודל עצמו */}
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.dragHandle} />

              {/* --- Header: שם הקובץ --- */}
              <View style={styles.headerContainer}>
                 <Image source={getHeaderIcon()} style={styles.headerIcon} />
                 <Text style={styles.headerTitle} numberOfLines={1}>{fileName}</Text>
              </View>

              {/* --- Loading State --- */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color="#1a73e8" />
                </View>
              ) : (
                <ScrollView>
                  
                  {/* Open */}
                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('open')}>
                      <Image source={ICON_OPEN} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Open</Text>
                    </TouchableOpacity>
                  )}

                  {/* Download */}
                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('download')}>
                      <Image source={ICON_DOWNLOAD} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Download</Text>
                    </TouchableOpacity>
                  )}

                  {/* Rename */}
                  {can_edit(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('rename')}>
                      <Image source={ICON_RENAME} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Rename</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  {/* Share & Link (שיטחתי את התת-תפריט) */}
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

                  {/* Move */}
                  {can_edit(fileRole) && can_edit(parentRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick('move')}>
                      <Image source={ICON_MOVE} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Move</Text>
                    </TouchableOpacity>
                  )}

                  {/* Star */}
                  {can_view(fileRole) && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemClick(isStarred ? 'remove_star' : 'add_star')}>
                      <Image source={isStarred ? ICON_STAR_REMOVE : ICON_STAR_ADD} style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>
                          {isStarred ? "Remove from starred" : "Add to starred"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  {/* Delete / Restore */}
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
                  
                  {/* סתם ריפוד קטן למטה */}
                  <View style={{height: 20}} />

                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FileActionModal;