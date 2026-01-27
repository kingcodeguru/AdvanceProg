import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function TestMenuScreen() {
  const router = useRouter();

  // פונקציה שמנווטת לדף שיצרנו בשלב 1 עם פרמטרים
  const goToDrive = (params: any) => {
    router.push({
      // הוספנו "as any" כדי להשתיק את השגיאה
      pathname: '/test-drive-display' as any, 
      params: params
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧪 FileDisplay Tester</Text>
      <Text style={styles.subHeader}>Check real component behavior</Text>

      {/* בדיקה 1: התיקייה הראשית */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => goToDrive({})}
      >
        <Text style={styles.btnText}>🏠 Root (My Drive)</Text>
        <Text style={styles.btnSub}>No params</Text>
      </TouchableOpacity>

      {/* בדיקה 2: כניסה לתיקייה ספציפית */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => goToDrive({ folderId: '123_test_folder' })}
      >
        <Text style={styles.btnText}>📁 Specific Folder</Text>
        <Text style={styles.btnSub}>folderId: 123_test_folder</Text>
      </TouchableOpacity>

      {/* בדיקה 3: קטגוריה (Starred) */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => goToDrive({ category: 'starred' })}
      >
        <Text style={styles.btnText}>⭐ Starred Category</Text>
        <Text style={styles.btnSub}>category: starred</Text>
      </TouchableOpacity>

      {/* בדיקה 4: חיפוש */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => goToDrive({ searchQuery: 'Project A' })}
      >
        <Text style={styles.btnText}>🔍 Search Query</Text>
        <Text style={styles.btnSub}>searchQuery: Project A</Text>
      </TouchableOpacity>

      {/* בדיקה 5: Recent */}
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => goToDrive({ category: 'recent' })}
      >
        <Text style={styles.btnText}>🕒 Recent Files</Text>
        <Text style={styles.btnSub}>category: recent</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  btn: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },
  btnSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});