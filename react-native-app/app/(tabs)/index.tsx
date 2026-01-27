import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Dev Dashboard 🛠️</Text>
        <Text style={styles.subtitle}>Choose a component to test:</Text>

        {/* --- כפתור חדש: בדיקת FileDisplay --- */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/test-menu' as any)}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📂</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Test File Display</Text>
            <Text style={styles.cardSub}>
              Checks: Navigation, View Modes (Grid/List), Header, Params
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* --- כפתור ישן: בדיקת UI כללית (אם שמרת אותו) --- */}
        {/* אפשר להוסיף כאן עוד כפתורים בעתיד */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Current Environment: Dev
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#5F6368',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 24,
    color: '#DADCE0',
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#BDC1C6',
    fontSize: 12,
  },
});