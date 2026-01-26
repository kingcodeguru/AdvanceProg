import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // הקופסה החיצונית
  boxFileWrapper: {
    width: 160, // קצת יותר צר כדי שייכנסו שניים בשורה ברוב המסכים
    margin: 8,
    // צללית עדינה (Elevation לאנדרואיד, Shadow ל-iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // הכרטיס עצמו
  customCardContainer: {
    backgroundColor: '#fff', // במובייל בדרך כלל הרקע לבן, אפשר לשנות לפי Theme
    borderRadius: 12,
    height: 180, // הקטנתי קצת כדי שיתאים למובייל
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee', // גבול עדין
  },

  // --- Header ---
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 48,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 4,
  },
  fileIconSmall: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  fileTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    flex: 1, // כדי שהטקסט יתפוס מקום ולא יחתך מיד
  },
  
  // כפתור שלוש נקודות
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5f6368',
    // ב-RN אי אפשר לשים טקסט ככה סתם, נשתמש ב-Image או Text
  },

  // --- Main Image Area ---
  imageContainer: {
    flex: 1, // תופס את כל המקום הפנוי
    paddingHorizontal: 10,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // --- Footer ---
  cardFooterArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    height: 40,
  },
  userImgFooter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  footerText: {
    fontSize: 10,
    color: '#5f6368',
    flex: 1,
  },
  actionIconImage: { // אייקון שלוש נקודות (תמונה)
    width: 20,
    height: 20,
    resizeMode: 'contain',
    opacity: 0.6, 
  },
});