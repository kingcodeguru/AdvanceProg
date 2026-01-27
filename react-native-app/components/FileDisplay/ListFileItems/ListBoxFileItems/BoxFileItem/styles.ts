import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CARD_WIDTH = (width / 2) - (CARD_MARGIN * 3); 

export const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 190, 
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  // --- תיקון לתמונה (בעיה 5) ---
  previewArea: {
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    padding: 20, // הוספתי פדינג כדי שהתמונה לא תיגע בקצוות אבל תהיה גדולה
  },
  // הוספתי סטייל ספציפי לתמונה בתוך previewArea אם צריך, 
  // אבל הסטייל הזה שולט על הקונטיינר שלה.
  // אם התמונה עצמה מוגדרת בקומפוננטה, וודאי שהיא resizeMode="contain"

  footerArea: {
    height: 52, 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  smallTypeIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 8, 
  },
  fileTitleContainer: {
    flex: 1, 
    marginRight: 8,
    justifyContent: 'center',
  },
  fileTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
  },
  actionBtn: {
    width: 32, 
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f4', 
    borderRadius: 8, 
  },
  actionMenuText: {
    fontSize: 18, 
    color: '#444', 
    fontWeight: 'bold', 
    marginBottom: 6, 
  },
});