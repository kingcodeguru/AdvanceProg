import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';

// הייבוא של הרכיבים שלך
import ListLineFileItems from '@/components/ListLineFileItems';
import FileActionModal from '@/components/FileActionModal';

// --- נתונים פיקטיביים ---
const MOCK_FILES = [
  { 
    fid: '101', 
    name: 'Project Proposal.docx', 
    type: 'text', 
    starred: false, 
    last_modified: Date.now(), // עכשיו
  },
  { 
    fid: '102', 
    name: 'Design Assets', 
    type: 'directory', 
    starred: true, 
    last_modified: Date.now() - 86400000, // לפני יום
  },
  { 
    fid: '103', 
    name: 'Vacation_2025.jpg', 
    type: 'image', 
    starred: false, 
    last_modified: Date.now() - 172800000, // לפני יומיים
  },
  { 
    fid: '104', 
    name: 'Budget_Q1.pdf', 
    type: 'text', 
    starred: true, 
    last_modified: Date.now() - 604800000, // לפני שבוע
  },
  { 
    fid: '105', 
    name: 'Old_Backup_Folder', 
    type: 'directory', 
    starred: false, 
    last_modified: Date.now() - 2592000000, // לפני חודש
  },
];

export default function ListLineTestScreen() {
  
  // 1. ניהול הקבצים (כדי שנוכל לרוקן ולמלא)
  const [currentFiles, setCurrentFiles] = useState(MOCK_FILES);
  
  // 2. ניהול המודל
  const [selectedFileForMenu, setSelectedFileForMenu] = useState<any>(null);

  // כפתור לבדיקת מצב "תיקייה ריקה"
  const toggleEmptyState = () => {
    if (currentFiles.length > 0) {
      setCurrentFiles([]); // רוקן
    } else {
      setCurrentFiles(MOCK_FILES); // מלא
    }
  };

  // הנדלר שמקבל את הפעולות מהרשימה
  const handleListAction = (action: string, file: any) => {
    if (action === 'open') {
      Alert.alert('File Clicked', `You opened: ${file.name}`);
    } 
    else if (action === 'menu') {
      setSelectedFileForMenu(file); // פתיחת המודל
    }
  };

  // הנדלר לפעולות בתוך המודל
  const handleModalAction = (action: string) => {
    console.log(`User selected: ${action} for file: ${selectedFileForMenu?.name}`);
    
    if (action === 'delete') {
      Alert.alert('Deleted', 'File removed from view');
      setCurrentFiles(prev => prev.filter(f => f.fid !== selectedFileForMenu.fid));
    }
    
    setSelectedFileForMenu(null); // סגירה
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Drive (List)</Text>
        
        {/* כפתור בדיקה */}
        <TouchableOpacity style={styles.testBtn} onPress={toggleEmptyState}>
          <Text style={styles.testBtnText}>
            {currentFiles.length > 0 ? "Test Empty" : "Test Full"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- הרכיב הנבדק: ListLineFileItems --- */}
      <View style={styles.listContainer}>
        <ListLineFileItems 
          files={currentFiles} 
          onAction={handleListAction} 
        />
      </View>

      {/* --- המודל הגלובלי --- */}
      {selectedFileForMenu && (
        <FileActionModal
          visible={!!selectedFileForMenu}
          onClose={() => setSelectedFileForMenu(null)}
          fileID={selectedFileForMenu.fid}
          fileName={selectedFileForMenu.name}
          fileType={selectedFileForMenu.type}
          isStarred={selectedFileForMenu.starred}
          onAction={handleModalAction}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202124',
  },
  testBtn: {
    backgroundColor: '#e8f0fe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  testBtnText: {
    color: '#1967d2',
    fontWeight: '600',
    fontSize: 13,
  },
  listContainer: {
    flex: 1, // קריטי כדי שהרשימה תמלא את המסך
  },
});