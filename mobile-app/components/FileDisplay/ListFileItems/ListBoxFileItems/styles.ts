import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  
  listContent: {
    paddingVertical: 12,
    alignItems: 'center', 
  },
  
  columnWrapper: {
    justifyContent: 'center', 
    gap: 0,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100, 
    width: '100%',
  },
  emptyImage: {
    width: 280, 
    height: 280,
    resizeMode: 'contain',
    opacity: 0.8,
  },
});