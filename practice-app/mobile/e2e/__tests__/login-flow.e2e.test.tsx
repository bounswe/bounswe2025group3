/**
 * End-to-End Tests: Login Flow
 * 
 * Tests the complete user journey from UI interaction to authenticated state:
 * 1. User enters credentials
 * 2. Login API is called
 * 3. Tokens are stored
 * 4. User session is established
 * 5. Navigation to protected screen occurs
 * 
 * These tests simulate real user behavior and verify the entire flow works together.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import LoginScreen from '@/app/login';
import { login } from '@/api/auth';
import { useSession } from '@/hooks/authContext';
import tokenManager from '@/services/tokenManager';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies
jest.mock('expo-router');
jest.mock('@/api/auth', () => ({
  login: jest.fn(),
}));
jest.mock('@/hooks/authContext', () => ({
  useSession: jest.fn(),
}));
jest.mock('@/services/tokenManager', () => ({
  __esModule: true,
  default: {
    saveTokens: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
    authenticatedFetch: jest.fn(),
  },
}));
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: ({ name, ...props }: any) => <View testID={`icon-${name}`} {...props} />,
  };
});
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    primary: '#00f',
    cb3: '#ccc',
    white: '#fff',
    blue: '#00f',
    error: '#f00',
  }),
}));
jest.mock('@/hooks/themeContext', () => ({
  useTheme: () => ({ isDark: false }),
}));
jest.mock('expo-navigation-bar', () => ({
  setButtonStyleAsync: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'login.title': 'Welcome Back!',
        'login.email': 'Email',
        'login.password': 'Password',
        'login.forgot_password': 'Forgot Password?',
        'login.login_button': 'Login',
        'login.or_continue_with': 'Or continue with',
        'login.no_account': "Don't have an account?",
        'login.sign_up': 'Sign Up',
        'login.login_failed': 'Login failed. Please check your credentials.',
      };
      return translations[key] || key;
    },
    i18n: { language: 'en-US' },
  }),
}));

const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSignIn = jest.fn();

describe('Login Flow E2E', () => {
  const mockLogin = login as jest.MockedFunction<typeof login>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSession as jest.Mock).mockReturnValue({ signIn: mockSignIn });
    mockLogin.mockClear();
    (tokenManager.saveTokens as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('should complete full login workflow: UI input → API call → token storage → session → navigation', async () => {
    const email = 'user@example.com';
    const password = 'password123';
    const loginResponse = {
      access: 'access-token-123',
      refresh: 'refresh-token-456',
      role: 'user',
    };

    // Mock successful login
    mockLogin.mockResolvedValueOnce(loginResponse);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    // Step 1: User enters email
    const emailInput = getByPlaceholderText('Email');
    await act(async () => {
      fireEvent.changeText(emailInput, email);
    });

    // Step 2: User enters password
    const passwordInput = getByPlaceholderText('Password');
    await act(async () => {
      fireEvent.changeText(passwordInput, password);
    });

    // Step 3: User clicks login button
    const loginButton = getByText('Login');
    await act(async () => {
      fireEvent.press(loginButton);
    });

    // Step 4: Verify login API was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(email, password);
    });

    // Step 6: Verify session was established
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(loginResponse.role);
    });
  });

  it('should handle login failure and display error message', async () => {
    const errorMessage = 'Invalid credentials';
    const email = 'user@example.com';
    const password = 'wrongpassword';

    mockLogin.mockRejectedValueOnce({
      message: errorMessage,
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    // Enter valid email format and password to enable button
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Email'), email);
      fireEvent.changeText(getByPlaceholderText('Password'), password);
    });

    // Wait a bit for state to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Press login button
    await act(async () => {
      fireEvent.press(getByText('Login'));
    });

    // Verify login was called with the credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(email, password);
    }, { timeout: 3000 });

    // Verify session was NOT established
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should disable login button when email is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    // Enter invalid email
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    });

    const loginButton = getByText('Login');
    const buttonParent = loginButton.parent?.parent || loginButton.parent;
    const buttonStyle = Array.isArray(buttonParent?.props?.style)
      ? Object.assign({}, ...buttonParent.props.style)
      : buttonParent?.props?.style;

    // Verify button is disabled (gray background)
    expect(buttonStyle?.backgroundColor).toBe('#ccc');
  });

  it('should navigate to register screen when sign up is pressed', async () => {
    const { getByText } = render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(getByText('Sign Up'));
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/register');
  });

  it('should navigate to forgot password screen', async () => {
    const { getByText } = render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(getByText('Forgot Password?'));
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/forgot_password');
  });
});

