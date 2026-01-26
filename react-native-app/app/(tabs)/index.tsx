import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
// תוודאי שהנתיב הזה נכון לקומפוננטה שיצרת
import MoveFileModal from '../../components/MoveFileModal'; 

export default function TestMoveScreen() {
  // 1. ה-State שמחזיק את המודל פתוח/סגור
  const [isModalVisible, setModalVisible] = useState(false);
  
  // 2. סטייט שרק מראה לנו על המסך אם הפעולה הצליחה
  const [statusMessage, setStatusMessage] = useState('Waiting for user action...');

  // נתונים פיקטיביים של קובץ שאנחנו כאילו מזיזים
  const testFile = {
    id: '12345',
    name: 'Vacation_Photos.zip'
  };

  // פונקציה שקורית כשהמודל מדווח שההעברה הצליחה
  const handleSuccess = () => {
    setStatusMessage('Success! File moved at ' + new Date().toLocaleTimeString());
    setModalVisible(false); // סגירת המודל
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.title}>Move Modal Test</Text>

        {/* קופסה שמציגה את פרטי הקובץ */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>File to move:</Text>
          <Text style={styles.fileName}>{testFile.name}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Last Status:</Text>
          <Text style={styles.status}>{statusMessage}</Text>
        </View>

        {/* הכפתור שפותח את המודל */}
        <Button 
          title="Open Move Menu" 
          onPress={() => setModalVisible(true)} 
        />

        {/* המודל עצמו */}
        <MoveFileModal
          visible={isModalVisible}
          fileId={testFile.id}
          fileName={testFile.name}
          onClose={() => setModalVisible(false)}
          onMoveSuccess={handleSuccess}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 40,
    color: '#202124',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f1f3f4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a73e8',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#dadce0',
    marginVertical: 15,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    color: '#188038', // ירוק
  },
});