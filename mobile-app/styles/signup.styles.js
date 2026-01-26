import {
  StyleSheet, 
  Platform
} from 'react-native';

export default StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignSelf: 'center',
  },
  signupTitle: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  signupForm: {
    gap: 16,
    padding: 32,
    borderWidth: 1,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }
    }),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  previewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewImg: {
    width: '100%',
    height: '100%',
  },
  defaultOpac: {
    opacity: 0.6,
  },
  uploadLabelBtn: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  signupInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#d93025',
  },
  signupSubmitBtn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupSubmitBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(217, 48, 37, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 48, 37, 0.2)',
    marginBottom: 8,
  },
  errorMessageText: {
    color: '#d93025',
    fontSize: 14,
    textAlign: 'center',
  },
  signupFooter: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  signinLink: {
    fontWeight: '600',
  },
});