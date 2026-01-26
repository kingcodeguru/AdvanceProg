import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
  loginPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginForm: {
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
  loginInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#d93025', // Hardcoded error red usually fine
  },
  loginSubmitBtn: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSubmitBtnText: {
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
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  secondaryBtn: {
    fontWeight: '600',
    fontSize: 14,
  },
});