import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // המעטפת הראשית
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
    width: '100%',
  },

  // הגדרות ה-FlatList
  listContent: {
    // אין צורך ב-padding צדדי כי השורות ממלאות את המסך
    paddingBottom: 100, // רווח למטה כדי שהפוטר לא יסתיר את הסוף
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // אותה הגדרה כמו ב-Box כדי לשמור על אחידות
    paddingTop: 80, 
  },
  
  emptyImage: {
    width: 280, 
    height: 280,
    opacity: 0.8,
  },
});