import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom'; // Needed for <Link>
import LoginPage from '../components/auth/LoginPage';

// ---
// 1. MOCK EXTERNAL DEPENDENCIES
// ---

// Mock axios to prevent real network requests
jest.mock('axios');

// Mock react-router-dom's hooks and components
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Keep other fns
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>, // Mock Link
}));

// Mock react-i18next to return the key as the translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Returns the translation key itself
  }),
}));

// Mock the GoogleLogin component
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <button
      data-testid="mock-google-login"
      onClick={() =>
        onSuccess({ credential: 'mocked_google_credential' })
      }
    >
      Mock Google Login
    </button>
  ),
}));

// Mock the Header child component
jest.mock('../components/common/Header', () => () => <div data-testid="mock-header">Mocked Header</div>);

// ---
// 2. TEST SETUP
// ---

// Define API URL for consistency in tests
const API_URL = 'http://127.0.0.1:8000/api';
process.env.REACT_APP_API_URL = API_URL;

// Helper to set up localStorage mock for each test
let localStorageStore = {};
beforeEach(() => {
  // Clear all mocks before each test
  mockedNavigate.mockClear();
  axios.post.mockClear(); 

  // Reset the store
  localStorageStore = {};

  // Mock localStorage by redefining the property on 'window'
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key) => localStorageStore[key] || null),
      setItem: jest.fn((key, value) => {
        localStorageStore[key] = String(value);
      }),
      clear: jest.fn(() => {
        localStorageStore = {};
      }),
      removeItem: jest.fn((key) => {
        delete localStorageStore[key];
      }),
    },
    writable: true,
  });
});

// Helper function to render the component with Router context
const renderComponent = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

// ---
// 3. THE TESTS
// ---

describe('LoginPage Component', () => {

  /**
   * Test 1: Basic Rendering
   * Checks if all key form elements are present when the page loads.
   */
  test('renders login form elements correctly', () => {
    renderComponent();

    // Check for headings and text
    expect(screen.getByText(/login.title_line1/i)).toBeInTheDocument();
    expect(screen.getByText('login.welcome')).toBeInTheDocument();

    // Check for form inputs (using their labels)
    expect(screen.getByLabelText('login.email_label')).toBeInTheDocument();
    expect(screen.getByLabelText('login.password_label')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: 'login.login_button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'login.signup_button' })).toBeInTheDocument();
    expect(screen.getByText('login.github_button')).toBeInTheDocument();

    // Check for mocked components
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-google-login')).toBeInTheDocument();
  });

  /**
   * Test 2: Standard Login - Success (Happy Path)
   * Simulates a user typing, submitting, and getting a successful response.
   */
  test('handles successful login on form submit', async () => {
    // 1. Arrange: Mock a successful API response
    const mockResponse = {
      data: {
        access: 'mock_access_token',
        refresh: 'mock_refresh_token',
        user_id: 123,
        email: 'test@example.com',
        role: 'user',
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    renderComponent();

    // 2. Act: Simulate user input
    fireEvent.change(screen.getByLabelText('login.email_label'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('login.password_label'), {
      target: { value: 'password123' },
    });

    // Act: Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: 'login.login_button' }));

    // 3. Assert: Wait for async actions to complete
    await waitFor(() => {
      // Check if axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/token/`,
        { email: 'test@example.com', password: 'password123' }
      );

      // Check if localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'mock_access_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'mock_refresh_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 123);
      expect(localStorage.setItem).toHaveBeenCalledWith('email', 'test@example.com');
      expect(localStorage.setItem).toHaveBeenCalledWith('role', 'user');

      // Check if the user was redirected
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  /**
   * Test 3: Standard Login - API Error
   * Simulates a user submitting invalid credentials and seeing an error message.
   */
  test('displays error message on failed login', async () => {
    // 1. Arrange: Mock a failed API response
    const mockError = {
      response: { data: { detail: 'Invalid Email or Password.' } },
    };
    axios.post.mockRejectedValue(mockError);

    renderComponent();

    // 2. Act: Fill and submit form
    fireEvent.change(screen.getByLabelText('login.email_label'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('login.password_label'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'login.login_button' }));

    // 3. Assert: Wait for the error message to appear
    // 'findBy' is a handy shortcut for 'waitFor' + 'getBy'
    const errorMessage = await screen.findByText(/Invalid Email or Password./i);
    expect(errorMessage).toBeInTheDocument();

    // Check that navigation did NOT happen
    expect(mockedNavigate).not.toHaveBeenCalled();
    // Check that tokens were NOT set
    expect(localStorage.setItem).not.toHaveBeenCalledWith('access_token', expect.anything());
  });

  /**
   * Test 4: Client-side Validation
   * Checks that the form shows an error if fields are empty.
   */
  test('shows client-side validation error if fields are empty', async () => {
    renderComponent();

    // 1. Act: Click login button with empty fields
    fireEvent.click(screen.getByRole('button', { name: 'login.login_button' }));

    // 2. Assert: Check for error message
    const errorMessage = await screen.findByText('Please enter both Email and Password.');
    expect(errorMessage).toBeInTheDocument();

    // Check that no API call was made
    expect(axios.post).not.toHaveBeenCalled();
  });

  /**
   * Test 5: Theme-based Image Switching
   * Tests the useEffect hook that listens for the 'themeChanged' event.
   */
  test('changes image source when themeChanged event is dispatched', async () => {
    renderComponent();

    // 1. Check initial state (green theme)
    const image = screen.getByAltText('Recycling bin character');
    expect(image.src).toContain('/wasteimage.png');
    expect(image.src).not.toContain('/wasteimage-blue.png');

    // 2. Arrange: Set the "new theme" in our mock localStorage
    localStorageStore['theme'] = 'blue';

    // 3. Act: Dispatch the custom event that the component listens for
    fireEvent(document, new CustomEvent('themeChanged'));

    // 4. Assert: Wait for the component to re-render
    await waitFor(() => {
      // Check if the image source has updated
      expect(image.src).toContain('/wasteimage-blue.png');
    });

    // 5. Test switching back
    localStorageStore['theme'] = 'green';
    fireEvent(document, new CustomEvent('themeChanged'));

    await waitFor(() => {
      expect(image.src).toContain('/wasteimage.png');
    });
  });

  /**
   * Test 6: Google Login Success
   * Tests the callback handler for the mocked Google Login button.
   */
  test('handles successful Google login', async () => {
    // 1. Arrange: Mock a successful backend response for the Google token
    const mockResponse = {
      data: {
        access: 'google_access_token',
        refresh: 'google_refresh_token',
        user_id: 456,
        email: 'google@example.com',
        role: 'user',
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    renderComponent();

    // 2. Act: Click the mock Google Login button
    fireEvent.click(screen.getByTestId('mock-google-login'));

    // 3. Assert
    await waitFor(() => {
      // Check that the backend was called with the mock credential
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/auth/google/`,
        { id_token: 'mocked_google_credential' }
      );

      // Check localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'google_access_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 456);

      // Check navigation
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});