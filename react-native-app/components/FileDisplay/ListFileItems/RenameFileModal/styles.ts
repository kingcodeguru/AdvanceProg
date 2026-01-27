import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 24,
    backgroundColor: '#F1F3F4',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#202124',
  },
  extensionText: {
    color: '#5F6368',
    fontSize: 16,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  buttonTextCancel: {
    color: '#5F6368',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextOk: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
});