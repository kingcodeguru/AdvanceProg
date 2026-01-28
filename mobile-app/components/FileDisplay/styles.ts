import { StyleSheet } from 'react-native';

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
    height: 70, 
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
    fontSize: 19, 
    fontWeight: '400',
    color: '#202124',
    flexShrink: 1, 
  },
  backButton: {
    padding: 10,
    marginRight: 4,
    marginLeft: -10,
  },
  
  // --- View Switcher ---
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 28, 
    padding: 4, 
    height: 46, 
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtn: {
    width: 42,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
  },
  switchBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },

  // --- Plus Button (FAB) - עיגול מושלם בצד ימין ---
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20, 
    backgroundColor: '#fff',
    width: 60, 
    height: 60,
    borderRadius: 30, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  // --- Modal / BottomSheet ---
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#3c4043',
    flex: 1,
    textAlign: 'left',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 8,
    marginHorizontal: 24,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputModalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  inputModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  inputBtn: {
    fontSize: 16,
    fontWeight: '500',
  },
});