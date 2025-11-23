import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AboutUsPage from '../components/aboutus/AboutUsPage'; 

// ---
// 1. MOCK EXTERNAL DEPENDENCIES
// ---

// Mock react-i18next
// This is CRITICAL: We ensure that when the component asks for 'about.values.list',
// it receives an array. This prevents a '.map is not a function' crash.
const mockCoreValues = [
  { name: 'Sustainability', icon: '♻️', description: 'Mock description for Sustainability.' },
  { name: 'Community', icon: '🤝', description: 'Mock description for Community.' }
];

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      // If 'returnObjects: true' is requested
      if (options && options.returnObjects) {
        if (key === 'about.values.list') {
          return mockCoreValues; // Return our mock array
        }
        return []; // Return an empty array for any other object requests
      }
      // For all other text, return the key itself
      return key;
    },
  }),
}));

// Mock the Header component
// We mock the child component to isolate the 'AboutUsPage' test.
// Path is relative to this test file (src/tests):
jest.mock('../components/common/Header', () => () => <div data-testid="mock-header">Mocked Header</div>);


// ---
// 2. TEST SETUP
// ---

// The Header component (or Link/NavLink within it) might need a router.
// Therefore, we wrap the component with <BrowserRouter> when rendering.
const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

// ---
// 3. THE TESTS
// ---

describe('AboutUsPage Component', () => {

  /**
   * Test 1: Basic Rendering
   * Checks if all static titles, text, and mocked components are on the screen.
   */
  test('renders all static sections and headings correctly', () => {
    renderWithRouter(<AboutUsPage />);

    // Check if the mocked Header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    // Check for page titles (as i18next keys)
    expect(screen.getByRole('heading', { name: 'about.header.title' })).toBeInTheDocument();
    expect(screen.getByText('about.header.subtitle')).toBeInTheDocument();

    // Check for the Vision section
    expect(screen.getByRole('heading', { name: 'about.vision.title' })).toBeInTheDocument();
    expect(screen.getByText('about.vision.text')).toBeInTheDocument();

    // Check for the Who We Are section
    expect(screen.getByRole('heading', { name: 'about.who_we_are.title' })).toBeInTheDocument();
    expect(screen.getByText('about.who_we_are.text')).toBeInTheDocument();

    // Check for the Values section
    expect(screen.getByRole('heading', { name: 'about.values.title' })).toBeInTheDocument();

    // Check for the Team section
    expect(screen.getByRole('heading', { name: 'about.team.title' })).toBeInTheDocument();
    expect(screen.getByText('about.team.subtitle')).toBeInTheDocument();

    // Check for the footer text
    expect(screen.getByText('about.simple_footer')).toBeInTheDocument();
  });

  /**
   * Test 2: Core Values List Test
   * Checks if the 'coreValues' array from the i18next mock is rendered.
   */
  test('renders the core values from the i18next mock', () => {
    renderWithRouter(<AboutUsPage />);

    // Look for the data from our mock array
    expect(screen.getByText(mockCoreValues[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockCoreValues[0].description)).toBeInTheDocument();

    expect(screen.getByText(mockCoreValues[1].name)).toBeInTheDocument();
    expect(screen.getByText(mockCoreValues[1].description)).toBeInTheDocument();
  });

  /**
   * Test 3: Team List Test
   * Checks if the hardcoded 'teamMembersData' array is rendered.
   */
  test('renders all hardcoded team members', () => {
    renderWithRouter(<AboutUsPage />);

    // Check a few names to verify the list
    expect(screen.getByText('Ahmet Okta')).toBeInTheDocument();
    expect(screen.getByText('Nilsu Tüysüz')).toBeInTheDocument();
    expect(screen.getByText('Selman Akman')).toBeInTheDocument();

    // Verify the total member count (11)
    // Find all spans with the 'team-member-name-simple' class
    const teamMembers = screen.getAllByText((content, element) => 
      element.tagName.toLowerCase() === 'span' && element.classList.contains('team-member-name-simple')
    );
    
    expect(teamMembers.length).toBe(11);
  });
});