import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // רקע חצי שקוף
    justifyContent: 'flex-end', // מצמיד את התוכן למטה
  },
  
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: height * 0.55, 
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingBottom: 20,
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

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
    width: 26,
    height: 26,
    marginRight: 12,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18, 
    fontWeight: '600',
    color: '#202124',
    flex: 1,
  },

  contentScroll: {
    paddingBottom: 30,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, 
    paddingHorizontal: 24,
  },
  
  // --- אייקונים רגילים + כוכב מלא ---
  menuItemIcon: {
    width: 28, 
    height: 28,
    marginRight: 20, 
    resizeMode: 'contain',
    opacity: 0.6,
  },

  // --- אייקון כוכב ריק (קטן יותר) ---
  emptyStarIcon: {
    width: 22,   // קטן יותר (היה 28)
    height: 22,
    marginRight: 26, // רווח גדול יותר (20 + 6) כדי לפצות
    resizeMode: 'contain',
    opacity: 0.6,
  },
  
  menuItemText: {
    fontSize: 16,
    color: '#3c4043',
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 8,
  },

  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
});