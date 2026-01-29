import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 20, 
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.5, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  
  menuItemIcon: {
    width: 24, 
    height: 24, 
    marginRight: 20,
    resizeMode: 'contain', 
    opacity: 0.6,
    alignSelf: 'center', 
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