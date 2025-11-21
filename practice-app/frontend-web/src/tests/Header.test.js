import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/common/Header';

// 1. Define a global mock function
// This ensures the test and the component reference the exact same function instance.
const mockChangeLanguage = jest.fn();

// 2. Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage, // Use the global stable mock
    },
  }),
}));

// 3. Mock the ThemeSwitcher component
// We simple mock it to avoid testing its internal logic here
jest.mock('../components/common/ThemeSwitcher', () => () => <button data-testid="mock-theme-switcher">Theme</button>);

const renderWithRouter = (ui) => render(ui, { wrapper: BrowserRouter });

describe('Header Component', () => {
  // Clear mock history before each test to ensure a clean state
  beforeEach(() => {
    mockChangeLanguage.mockClear();
  });

  test('renders logo and app name', () => {
    renderWithRouter(<Header />);
    expect(screen.getByAltText('Greener Logo')).toBeInTheDocument();
    expect(screen.getByText('GREENER')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('common.nav.home')).toBeInTheDocument();
    expect(screen.getByText('common.nav.about')).toBeInTheDocument();
    // You can add checks for other links here
  });

  test('toggles language on click', () => {
    renderWithRouter(<Header />);

    // Since the default language is mocked as 'en', the button shows 'TR'
    const langButton = screen.getByText('TR');
    fireEvent.click(langButton);

    // Verify that the global mock function was called with 'tr'
    expect(mockChangeLanguage).toHaveBeenCalledWith('tr');
  });

  test('renders theme switcher', () => {
    renderWithRouter(<Header />);
    expect(screen.getByTestId('mock-theme-switcher')).toBeInTheDocument();
  });
});