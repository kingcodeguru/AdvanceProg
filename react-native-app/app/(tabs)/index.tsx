import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import FileActionModal from '@/components/FileActionModal'; 

export default function FileActionModalTest() {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastAction, setLastAction] = useState('None');
  
  // State שמחזיק את נתוני הקובץ
  const [testFile, setTestFile] = useState({
    fid: '123',
    name: 'Test_File.pdf',
    type: 'text',
    starred: false // --- שינוי: מתחיל בלי כוכב ---
  });

  const handleOpenModal = (type: string, name: string) => {
    // כשפותחים, אנחנו רק מעדכנים את הסוג והשם, ושומרים על מצב הכוכב הנוכחי
    setTestFile(prev => ({ ...prev, type, name }));
    setModalVisible(true);
  };

  const handleAction = (actionName: string) => {
    console.log('Action:', actionName);
    setLastAction(actionName);

    // --- השינוי: לוגיקה לשינוי הכוכב בזמן אמת ---
    if (actionName === 'add_star') {
        setTestFile(prev => ({ ...prev, starred: true }));
    } 
    else if (actionName === 'remove_star') {
        setTestFile(prev => ({ ...prev, starred: false }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.title}>בדיקת תפריט</Text>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>סטטוס כוכב:</Text>
          {/* מראה ויזואלית אם יש כוכב או אין */}
          <Text style={{ fontSize: 20 }}>{testFile.starred ? '⭐ מסומן' : '☆ לא מסומן'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleOpenModal('directory', 'My Projects')}
        >
          <Text style={styles.btnText}>תיקייה</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.btnBlue]} 
          onPress={() => handleOpenModal('image', 'Vacation.jpg')}
        >
          <Text style={styles.btnText}>תמונה</Text>
        </TouchableOpacity>

        <FileActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAction={handleAction}
          fileID={testFile.fid}
          fileName={testFile.name}
          fileType={testFile.type}
          isStarred={testFile.starred} // המודל מקבל את המצב המעודכן
          isTrashed={false}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  statusBox: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 8, width: '100%', 
    alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#ddd' 
  },
  statusLabel: { fontSize: 14, color: '#888' },
  button: { 
    backgroundColor: '#5f6368', padding: 12, borderRadius: 8, width: '80%', 
    alignItems: 'center', marginBottom: 15 
  },
  btnBlue: { backgroundColor: '#1a73e8' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});