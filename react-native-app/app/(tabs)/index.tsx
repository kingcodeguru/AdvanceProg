import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
// תוודאי שהנתיב נכון
import FileActionModal from '@/components/FileActionModal'; 

export default function FileActionModalTest() {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastAction, setLastAction] = useState('None');
  
  // משתנים לבדיקה - אפשר לשחק איתם
  const [testFile, setTestFile] = useState({
    fid: '123',
    name: 'Vacation_Photos.zip',
    type: 'directory', // תנסי לשנות ל: 'image' או 'text'
    starred: true
  });

  const handleOpenModal = (type: string, name: string) => {
    setTestFile({ ...testFile, type, name });
    setModalVisible(true);
  };

  const handleAction = (actionName: string) => {
    console.log('Action selected:', actionName);
    setLastAction(actionName);
    // כאן המודל נסגר אוטומטית ע"י הקומפוננטה, אבל אנחנו צריכים לעדכן את ה-State שלנו
    // ה-onClose ייקרא בכל מקרה
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.title}>בדיקת תפריט פעולות</Text>
        <Text style={styles.subtitle}>לחץ על כפתור כדי לפתוח את התפריט</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Last Action:</Text>
          <Text style={styles.statusValue}>{lastAction}</Text>
        </View>

        {/* כפתור 1: בדיקת תיקייה */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleOpenModal('directory', 'My Projects')}
        >
          <Text style={styles.btnText}>Open as Folder</Text>
        </TouchableOpacity>

        {/* כפתור 2: בדיקת תמונה */}
        <TouchableOpacity 
          style={[styles.button, styles.btnBlue]} 
          onPress={() => handleOpenModal('image', 'Sunset.png')}
        >
          <Text style={styles.btnText}>Open as Image</Text>
        </TouchableOpacity>

        {/* כפתור 3: בדיקת קובץ טקסט */}
        <TouchableOpacity 
          style={[styles.button, styles.btnGreen]} 
          onPress={() => handleOpenModal('text', 'Resume.docx')}
        >
          <Text style={styles.btnText}>Open as Document</Text>
        </TouchableOpacity>

        {/* המודל עצמו */}
        <FileActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAction={handleAction}
          fileID={testFile.fid}
          fileName={testFile.name}
          fileType={testFile.type}
          isStarred={testFile.starred}
          isTrashed={false}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  statusBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  button: {
    backgroundColor: '#5f6368',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  btnBlue: {
    backgroundColor: '#1a73e8',
  },
  btnGreen: {
    backgroundColor: '#1e8e3e',
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});