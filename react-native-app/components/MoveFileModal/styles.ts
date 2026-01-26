import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dadce0',
    minHeight: 70, 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  // עיצוב לאייקון חזור (תמונה)
  backIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitlesContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1, 
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 2,
  },
  headerSubTitle: {
    fontSize: 14,
    color: '#5F6368', 
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  // עיצוב לאייקון חיפוש/סגירה (תמונה)
  actionIconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    opacity: 0.6, // קצת שקיפות כמו האייקונים האפורים
  },

  // --- List Content ---
  listContent: {
    paddingBottom: 90, 
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  folderIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // עיצוב לאייקון התיקייה עצמה
  folderImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  folderName: {
    fontSize: 16,
    color: '#202124',
    textAlign: 'left',
  },
  
  // --- Search Overlay ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    margin: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#202124',
    textAlign: 'left',
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButtonText: {
    color: '#5F6368',
    fontSize: 14,
    fontWeight: '500',
  },
  moveButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  moveButtonDisabled: {
    backgroundColor: '#f1f3f4', 
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  moveButtonTextDisabled: {
    color: '#bdc1c6', 
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#5F6368',
    fontSize: 14,
  },
});