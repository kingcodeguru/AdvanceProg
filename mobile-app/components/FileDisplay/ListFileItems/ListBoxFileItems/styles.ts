import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  
  listContent: {
    paddingVertical: 12,
    alignItems: 'center', 
  },
  
  columnWrapper: {
    justifyContent: 'center', 
    gap: 0,
  },

  // --- התיקון שביקשת: הגדלת התיקייה הריקה ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // נשתמש ב-paddingTop כדי למרכז אותה יפה בעין
    paddingTop: 100, 
    width: '100%',
  },
  emptyImage: {
    // הגדלנו ל-280 (או אפילו יותר אם צריך) כדי שזה יהיה בולט
    width: 280, 
    height: 280,
    resizeMode: 'contain',
    opacity: 0.8,
  },
});