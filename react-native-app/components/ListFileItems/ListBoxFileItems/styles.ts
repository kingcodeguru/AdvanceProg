import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // המעטפת הראשית
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
    width: '100%',
  },

  // הגדרות ה-FlatList
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 6, 
    paddingBottom: 100, 
  },

  // ריווח בין הטורים
  columnWrapper: {
    justifyContent: 'flex-start',
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // שימי לב: ה-paddingTop תלוי איפה את רוצה שהתמונה "תצוף".
    // אם את רוצה אותה ממש באמצע המסך, אפשר למחוק את ה-paddingTop.
    // אם את רוצה אותה קצת למטה (כמו ב-Web עם ה-margin-top), תשאירי את זה.
    paddingTop: 80, 
  },
  
  emptyImage: {
    width: 280, 
    height: 280,
    opacity: 0.8,
    // מחקתי את ה-marginBottom כי אין טקסט מתחת
  },
});