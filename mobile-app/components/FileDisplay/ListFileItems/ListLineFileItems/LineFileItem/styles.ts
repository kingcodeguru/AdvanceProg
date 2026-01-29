import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f3f4',
  },

  rowContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    height: 72, 
    paddingHorizontal: 20,
  },

  iconContainer: {
    marginRight: 20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    width: 24, 
    height: 24,
    resizeMode: 'contain',
  },

  textContainer: {
    flex: 1, 
    justifyContent: 'center',
    marginRight: 10, 
  },
  fileName: {
    fontSize: 16,
    color: '#1f1f1f', 
    fontWeight: '500', 
    marginBottom: 4, 
    textAlign: 'left',
  },
  fileDetails: {
    fontSize: 13,
    color: '#80868b', 
    fontWeight: '400',
    textAlign: 'left',
  },

  menuBtn: {
    width: 36, 
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
  },
  
  menuText: {
    fontSize: 22,
    color: '#444',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: -12, 
  },
});