import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // הגדלנו את הגובה של כל ה-Header כדי שהסוויץ' לא ירגיש חנוק
    height: 80, 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // הוספת מרווח בטוח מהסוויץ'
    marginRight: 15, 
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    color: '#202124',
    // מבטיח שהטקסט לא יחרוג מהשטח שלו
    flexShrink: 1, 
  },
  backButton: {
    padding: 12,
    marginRight: 4,
    marginLeft: -12,
  },
  
  // --- התיקון לסוויץ' שבאמת יגדיל אותו ---
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 28, 
    padding: 4, 
    // הוספת גובה ורוחב מינימליים מבטיחה שהקופסה תגדל
    height: 50, 
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtn: {
    // כל כפתור בתוך הסוויץ' מקבל גודל מוגדר
    width: 46,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  switchBtnActive: {
    backgroundColor: '#fff',
    // צל שגורם לזה לבלוט
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});