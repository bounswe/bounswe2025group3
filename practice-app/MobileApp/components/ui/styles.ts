import { Platform, StyleSheet } from 'react-native';

// Define color constants to match web frontend
const colors = {
  primary: '#2E7D32',        // Primary green
  secondary: '#56ea62',      // Lighter green from web
  primaryDark: '#122e1a',    // Dark green from web gradient
  primaryLight: '#88eb9a',   // Light green from web gradient
  background: '#E8F5E9',     // Light background
  white: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#555555',
    light: '#666666',
  }
};

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `rgba(${parseInt(colors.primaryLight.slice(1, 3), 16)}, ${parseInt(colors.primaryLight.slice(3, 5), 16)}, ${parseInt(colors.primaryLight.slice(5, 7), 16)}, 0.5)`,
    top: -100,
    left: -100,
    opacity: 0.5,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `rgba(${parseInt(colors.primaryLight.slice(1, 3), 16)}, ${parseInt(colors.primaryLight.slice(3, 5), 16)}, ${parseInt(colors.primaryLight.slice(5, 7), 16)}, 0.5)`,
    bottom: -50,
    right: -50,
    opacity: 0.5,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.light,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text.primary,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        paddingVertical: 8,
      },
    }),
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.text.light,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  // Common styles from login and register
  content: {
    width: '80%',
    alignItems: 'center',
  },
  link: {
    marginTop: 15,
    color: colors.primary,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  // Common styles from index
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureText: {
    marginLeft: 10,
    color: colors.primary,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: colors.secondary,
    transition: 'transform 0.3s ease, background-color 0.3s ease',
  },
  registerButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  buttonIcon: {
    marginRight: 10,
  },
  registerButtonText: {
    color: colors.primary,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
  },
}); 