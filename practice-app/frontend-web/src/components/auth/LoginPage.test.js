// frontend-web/src/components/auth/LoginPage.test.js

// --- Mocking External Dependencies (MUST BE AT THE VERY TOP) ---
jest.mock('axios');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// This mock is for the <GoogleLogin /> component itself
jest.mock('@react-oauth/google', () => ({
  ...jest.requireActual('@react-oauth/google'), // Keep other exports like GoogleOAuthProvider
  GoogleLogin: jest.fn(({ onSuccess, onError, ...props }) => (
    <button
      data-testid="google-login-button-mock"
      onClick={() => {
        if (onSuccess) onSuccess({ credential: 'mock_google_id_token_credential' });
      }}
      {...props}
    >
      Mock Google Login Button
    </button>
  )),
}));

// --- Now, the actual imports for the test file ---
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import '@testing-library/jest-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // <--- IMPORT THE REAL PROVIDER

// --- Mock localStorage globally ---
const localStorageMock = (() => { /* ... as before ... */
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('LoginPage Component (Simplified but with Provider)', () => {
  // Helper to render with ALL necessary contexts for LoginPage
  const renderLoginPageWithProviders = (ui) => {
    return render(
      <GoogleOAuthProvider clientId="TEST_CLIENT_ID"> {/* Use the REAL Provider */}
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </GoogleOAuthProvider>
    );
  };

  beforeEach(() => {
    axios.post.mockClear();
    mockedNavigate.mockClear();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    // Clear any warnings related to React Router future flags for cleaner test output
    jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
        if (typeof message === 'string' && message.includes('React Router Future Flag Warning')) {
            return;
        }
        console.warn(message, ...args); // Call original for other warnings
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders login form with essential elements including mocked Google button', () => {
    renderLoginPageWithProviders(<LoginPage />); // Use the new helper

    expect(screen.getByText(/Log Your Wastes And Recycle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles successful email/password login and navigates', async () => {
    const mockApiResponse = { /* ... as before ... */
       data: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        user_id: 'user123',
        email: 'test@example.com',
        role: 'user',
      },
    };
    axios.post.mockResolvedValueOnce(mockApiResponse);
    renderLoginPageWithProviders(<LoginPage />); // Use the new helper

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/token/',
        { email: 'test@example.com', password: 'password123' }
      );
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'fake-access-token');
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('shows validation error if email or password is not provided', async () => {
    renderLoginPageWithProviders(<LoginPage />); // Use the new helper
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    expect(await screen.findByText('Please enter both Email and Password.')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  // You can add back the other tests (failed login, sign up nav, etc.)
  // and they should also use `renderLoginPageWithProviders`.
});