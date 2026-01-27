import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 80, 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15, 
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    color: '#202124',
    flexShrink: 1, 
  },
  backButton: {
    padding: 12,
    marginRight: 4,
    marginLeft: -12,
  },
  
  // --- View Switcher (הסוויץ' המוגדל) ---
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 28, 
    padding: 4, 
    height: 50, 
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtn: {
    width: 46,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  switchBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  // --- Floating Action Button (FAB) ---
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 20, // מיקום צד שמאל לפי התמונה
    backgroundColor: '#fff',
    width: 65,
    height: 65,
    borderRadius: 16, // עיצוב מרובע מעוגל (Google Style)
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fabIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },

  // --- Modal / BottomSheet Menu ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // החשכה של הרקע
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 8,
    width: '100%',
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row-reverse', // סידור לפי התמונה (טקסט מימין, אייקון משמאל)
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16, // רווח בין האייקון לטקסט
  },
  menuText: {
    fontSize: 17,
    color: '#3c4043',
    flex: 1,
    textAlign: 'right', // טקסט מיושר לימין (עברית)
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 8,
    marginHorizontal: 20,
  },

  // --- Containers ---
  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});