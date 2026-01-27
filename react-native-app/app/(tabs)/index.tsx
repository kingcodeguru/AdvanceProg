import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, Alert } from 'react-native';

// הייבוא של הרכיבים שלך
import BoxFileItem from '@/components/BoxFileItem';
import FileActionModal from '@/components/FileActionModal';

// --- נתונים פיקטיביים לבדיקה ---
const MOCK_FILES = [
  { 
    fid: '101', 
    name: 'Summer Vacation', 
    type: 'directory', 
    starred: false, 
    last_modified: Date.now(), 
    owner_avatar: 'https://cdn-icons-png.flaticon.com/512/147/147144.png' 
  },
  { 
    fid: '102', 
    name: 'Profile_Pic.jpg', 
    type: 'image', 
    starred: true, 
    last_modified: Date.now() - 10000000, 
    owner_avatar: 'https://cdn-icons-png.flaticon.com/512/147/147144.png'
  },
  { 
    fid: '103', 
    name: 'Resume_Final.docx', 
    type: 'text', 
    starred: false, 
    last_modified: Date.now() - 50000000,
    owner_avatar: null 
  },
  { 
    fid: '104', 
    name: 'Project Specs.pdf', 
    type: 'text', 
    starred: true, 
    last_modified: Date.now(),
    owner_avatar: null 
  },
];

export default function BoxFileItemTest() {
  
  // זה ה-State שמחזיק את הקובץ שנבחר כרגע לתפריט
  // אם זה null -> המודל סגור
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // פתיחת קובץ (לחיצה רגילה)
  const handleOpen = (file: any) => {
    Alert.alert("Opening File", `Opening: ${file.name}`);
  };

  // פתיחת תפריט (לחיצה על 3 נקודות)
  const handleMenuPress = (file: any) => {
    console.log("Opening menu for:", file.name);
    setSelectedFile(file); // זה יגרום למודל להיפתח
  };

  // ביצוע פעולה מהתפריט
  const handleAction = (action: string) => {
    console.log(`Action requested: ${action} on file: ${selectedFile?.name}`);
    
    // כאן תהיה הלוגיקה האמיתית שלך (מחיקה, שיתוף וכו')
    // לדוגמה:
    if (action === 'rename') {
       Alert.alert("Action", "Rename clicked (Next step: Open Rename Modal)");
    }
    
    // סגירת המודל (למרות שהמודל סוגר את עצמו ויזואלית, צריך לאפס את ה-State)
    setSelectedFile(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Box File Grid Test</Text>
        <Text style={styles.subtitle}>לחיצה ארוכה או 3 נקודות לתפריט</Text>
      </View>

      {/* רשימת הקבצים */}
      <FlatList
        data={MOCK_FILES}
        keyExtractor={(item) => item.fid}
        numColumns={2} // תצוגת גריד (זוגות)
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BoxFileItem 
            fileData={item}
            
            // 1. לחיצה רגילה
            onPress={() => handleOpen(item)}
            
            // 2. לחיצה על תפריט -> מעדכנים את האבא (אותנו)
            onMenuPress={() => handleMenuPress(item)}
          />
        )}
      />

      {/* המודל היחיד והמיוחד!
         הוא חי מחוץ לרשימה, ונפתח רק כשיש selectedFile.
      */}
      {selectedFile && (
        <FileActionModal
          visible={!!selectedFile} // אם יש קובץ, תציג true
          onClose={() => setSelectedFile(null)} // סגירה מאפסת את הבחירה
          
          // העברת הנתונים של הקובץ הנבחר למודל
          fileID={selectedFile.fid}
          fileName={selectedFile.name}
          fileType={selectedFile.type}
          isStarred={selectedFile.starred}
          isTrashed={false}
          
          onAction={handleAction}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContent: {
    padding: 10,
    // זה עוזר ליישר את הגריד אם יש רווחים
    alignItems: 'flex-start', 
  },
});