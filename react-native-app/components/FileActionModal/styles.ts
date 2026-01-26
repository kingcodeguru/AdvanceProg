import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // הרקע השקוף מאחורי המודל
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // החשכה של המסך
    justifyContent: 'flex-end', // מצמיד את התוכן למטה
  },
  
  // הקופסה הלבנה שעולה מלמטה
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20, // רווח למטה (במיוחד לאייפונים חדשים)
    maxHeight: '80%', // לא לתפוס את כל המסך
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },

  // הקו האפור הקטן למעלה (ידית גרירה)
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },

  // כותרת עם שם הקובץ
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    marginBottom: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    flex: 1,
  },

  // פריט בתפריט
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    resizeMode: 'contain',
    opacity: 0.6, // צבע אפור עדין לאייקונים
  },
  menuItemText: {
    fontSize: 16,
    color: '#3c4043',
  },

  // קו מפריד
  divider: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 8,
  },

  // אינדיקטור טעינה
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});