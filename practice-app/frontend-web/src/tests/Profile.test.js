import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api'; // The module we need to mock
import Profile from '../components/profile/Profile'; // Adjust this path if needed

// ---
// 1. MOCK EXTERNAL DEPENDENCIES
// ---

// Mock the api service module
// This automatically replaces getUserProfile and updateUserProfile with jest.fn()
jest.mock('../services/api');

// Mock react-router-dom's hooks
// We don't use navigate here, but it's good practice if other components do
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Returns the translation key itself
  }),
}));

// Mock the Navbar child component
jest.mock('../components/common/Navbar', () => () => <div data-testid="mock-navbar">Mocked Navbar</div>);

// ---
// 2. TEST SETUP
// ---

// Helper to set up localStorage mock for each test
let localStorageStore = {};
beforeEach(() => {
  // Clear all mocks before each test
  mockedNavigate.mockClear();
  // Clear the mock function call history
  getUserProfile.mockClear();
  updateUserProfile.mockClear();

  // Reset the localStorage store
  localStorageStore = {};

  // Mock localStorage
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
      <Profile />
    </BrowserRouter>
  );
};

// Define a mock profile for consistent test data
const MOCK_PROFILE_DATA = {
  first_name: 'Test',
  last_name: 'User',
  bio: 'This is a test bio.',
  city: 'Testville',
  country: 'Testland',
  notifications_enabled: false,
};

// ---
// 3. THE TESTS
// ---

describe('Profile Page Component', () => {

  /**
   * Test 1: Loading State and Successful Data Fetch
   * Checks that the component shows a loading state, fetches data, and populates the form.
   */
  test('renders loading state, then populates form on successful fetch', async () => {
    // 1. Arrange: Mock a successful API response
    getUserProfile.mockResolvedValue(MOCK_PROFILE_DATA);

    // 2. Act: Render the component
    renderComponent();

    // 3. Assert: Check for loading state first
    expect(screen.getByText('profile_page.loading')).toBeInTheDocument();

    // 4. Assert: Wait for the component to re-render after fetch
    await waitFor(() => {
      // Check that loading text is gone
      expect(screen.queryByText('profile_page.loading')).not.toBeInTheDocument();

      // Check that form fields are populated with mock data
      expect(screen.getByLabelText(/profile_page.form.first_name_label/i)).toHaveValue(MOCK_PROFILE_DATA.first_name);
      expect(screen.getByLabelText(/profile_page.form.last_name_label/i)).toHaveValue(MOCK_PROFILE_DATA.last_name);
      expect(screen.getByLabelText(/profile_page.form.bio_label/i)).toHaveValue(MOCK_PROFILE_DATA.bio);
      expect(screen.getByLabelText(/profile_page.form.notifications_label/i)).not.toBeChecked();
    });
  });

/**
   * Test 2: Handles Input Changes
   * Checks that typing in fields updates the component's state (and the input's value).
   */
test('handles form input changes', async () => {
    // 1. Arrange
    getUserProfile.mockResolvedValue(MOCK_PROFILE_DATA);
    renderComponent();
    
    // 2. Act: Wait for ALL elements to appear
    let firstNameInput;
    let notificationsCheckbox;
    await waitFor(() => {
      firstNameInput = screen.getByLabelText(/profile_page.form.first_name_label/i);
      notificationsCheckbox = screen.getByLabelText(/profile_page.form.notifications_label/i);
    });

    // 3. Act: Now simulate user typing
    fireEvent.change(firstNameInput, { target: { value: 'NewFirstName' } });
    fireEvent.click(notificationsCheckbox);

    // 4. Assert
    expect(firstNameInput).toHaveValue('NewFirstName');
    expect(notificationsCheckbox).toBeChecked();
  });
  /**
   * Test 3: Failed Profile Update
   * Checks that an error message is shown if the API update fails.
   */
  test('displays error message on failed initial fetch', async () => {
    // 1. Arrange: Mock a *failed* fetch
    getUserProfile.mockRejectedValue(new Error('Network Error'));

    // 2. Act: Render
    renderComponent();

    // 3. Assert: Wait for the error message
    await waitFor(() => {
      // Check that the fetch error message is shown
      expect(screen.getByText('profile_page.error_fetch')).toBeInTheDocument();
      // Check that the loader is gone
      expect(screen.queryByText('profile_page.loading')).not.toBeInTheDocument();
      
      // THIS IS THE FIX: Assert the form IS rendered, but empty.
      expect(screen.getByLabelText(/profile_page.form.first_name_label/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profile_page.form.first_name_label/i)).toHaveValue('');
    });
  });
});