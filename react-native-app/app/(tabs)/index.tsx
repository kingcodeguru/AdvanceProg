import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar
} from 'react-native';

// הייבוא של הרכיב הראשי שלך
import ListFileItems from '@/components/ListFileItems';

// --- נתונים פיקטיביים לבדיקה (Mock Data) ---
const MOCK_FILES = [
  { 
    fid: '1', 
    name: 'Vacation Photos', 
    type: 'directory', 
    starred: false, 
    last_modified: Date.now(), 
    trashed: false 
  },
  { 
    fid: '2', 
    name: 'Project_Specs.pdf', 
    type: 'text', 
    starred: true, 
    last_modified: Date.now() - 3600000, 
    trashed: false 
  },
  { 
    fid: '3', 
    name: 'Selfie.jpg', 
    type: 'image', 
    starred: false, 
    last_modified: Date.now() - 86400000, 
    trashed: false 
  },
  { 
    fid: '4', 
    name: 'Work Documents', 
    type: 'directory', 
    starred: true, 
    last_modified: Date.now() - 100000000, 
    trashed: false 
  },
  { 
    fid: '5', 
    name: 'Old Backup', 
    type: 'directory', 
    starred: false, 
    last_modified: Date.now() - 500000000, 
    trashed: true // קובץ באשפה לבדיקת מחיקה לצמיתות
  },
];

export default function DriveTestScreen() {
  
  // 1. ניהול מצב התצוגה (גריד או רשימה)
  const [viewMode, setViewMode] = useState<'box' | 'line'>('box');
  
  // 2. ניהול הקבצים
  const [files, setFiles] = useState<any[]>(MOCK_FILES);
  const [loading, setLoading] = useState(false);

  // פונקציה שמדמה "רענון" מהשרת
  const handleRefresh = async () => {
    setLoading(true);
    console.log("Refreshing data...");
    
    // כאן בעתיד תהיה קריאה לשרת: await getFilesByDirectory(...)
    // כרגע נדמה השהיה קטנה
    setTimeout(() => {
      setLoading(false);
      // הערה: בגלל שאנחנו בבדיקה ללא שרת אמיתי, הפעולות (מחיקה/שינוי שם)
      // ייכשלו בתוך ListFileItems כי ה-API יחזיר שגיאה.
      // אבל זה מוכיח שהאינטראקציה עובדת!
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.title}>My Drive</Text>
        
        {/* כפתור החלפת תצוגה */}
        <TouchableOpacity 
          style={styles.toggleBtn} 
          onPress={() => setViewMode(prev => prev === 'box' ? 'line' : 'box')}
        >
          {/* אייקון פשוט להמחשה */}
          <Text style={styles.toggleText}>
            {viewMode === 'box' ? 'Show List ≣' : 'Show Grid ⊞'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Main Content --- */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
        ) : (
          <ListFileItems 
            files={files}
            viewMode={viewMode}
            onRefresh={handleRefresh}
            showFooter={true}
          />
        )}
      </View>

      {/* --- Footer Info (רק לבדיקות) --- */}
      <View style={styles.debugFooter}>
        <Text style={styles.debugText}>
          Current View: {viewMode.toUpperCase()} | Files: {files.length}
        </Text>
      </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
  },
  toggleBtn: {
    backgroundColor: '#f1f3f4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5f6368',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  debugFooter: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
  },
});