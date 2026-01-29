import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
    width: '100%',
  },

  listContent: {
    paddingBottom: 100,
  },

 
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80, 
  },
  
  emptyImage: {
    width: 280, 
    height: 280,
    opacity: 0.8,
  },
});