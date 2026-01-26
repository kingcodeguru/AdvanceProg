import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#333',
  },
  fileInfo: {
    fontSize: 12,
    color: '#888',
  },
  moreButton: {
    // הוספת הריבוע האפור סביב הכפתור
    width: 36,
    height: 36,
    backgroundColor: '#e0e0e0', 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});