import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    // החזרתי את הקווים המפרידים
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f3f4', // אפור עדין מאוד
  },

  rowContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    // הגדלתי משמעותית את הגובה כדי שיהיה אוויר למעלה ולמטה
    height: 72, 
    paddingHorizontal: 20, // ריפוד בצדדים
  },

  // --- צד שמאל: אייקון ---
  iconContainer: {
    // הגדלתי את הרווח בין האייקון לטקסט
    marginRight: 20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    width: 24, 
    height: 24,
    resizeMode: 'contain',
  },

  // --- אמצע: טקסט ---
  textContainer: {
    flex: 1, 
    justifyContent: 'center',
    marginRight: 10, 
  },
  fileName: {
    fontSize: 16, // פונט קצת יותר גדול וברור
    color: '#1f1f1f', 
    fontWeight: '500', 
    marginBottom: 4, 
    textAlign: 'left',
  },
  fileDetails: {
    fontSize: 13,
    color: '#80868b', // אפור אלגנטי
    fontWeight: '400',
    textAlign: 'left',
  },

  // --- צד ימין: תפריט ---
  menuBtn: {
    width: 36, 
    height: 36,
    justifyContent: 'center', // ממרכז את הטקסט אנכית ואופקית
    alignItems: 'center',
    backgroundColor: '#f1f3f4', // הריבוע האפור
    borderRadius: 12, // פינות מעוגלות (Squircle)
  },
  
  menuText: {
    fontSize: 22,
    color: '#444',
    fontWeight: 'bold',
    letterSpacing: 1,
    // --- התיקון הקריטי ליישור הנקודות ---
    // הנקודות כטקסט תמיד יושבות נמוך ("Baseline").
    // המינוס הזה מושך אותן למעלה למרכז הריבוע.
    marginTop: -12, 
  },
});