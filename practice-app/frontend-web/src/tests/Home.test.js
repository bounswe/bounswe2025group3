import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/home/Home';

// ---
// 1. MOCK EXTERNAL DEPENDENCIES
// ---


// Mock react-i18next for translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options && options.returnObjects) {
        if (key === 'home.eco_tips') {
          // THIS IS THE FIX: Provide *two* tips for the rotation test
          return [
            { text: 'Mock tip 1', related_category: 'Recycling' },
            { text: 'Mock tip 2', related_category: 'Energy' },
          ];
        }
        return []; // For badges, testimonials, etc.
      }
      return key;
    },
  }),
}));

// Mock Header component (path from src/tests to src/components/common/Header)
jest.mock('../components/common/Header', () => () => <div data-testid="mock-header">Mocked Header</div>);

// Mock InfoBox component (path from src/tests to src/components/home/InfoBox)
jest.mock('../components/home/InfoBox', () => () => <div data-testid="mock-info-box">Mocked InfoBox</div>);

// Mock react-router-dom's Link for navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to} data-testid={`mock-link-${to}`}>{children}</a>,
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

// ---
// 2. TEST SETUP
// ---

// Wrapper for routing context
const renderWithRouter = (ui) => render(ui, { wrapper: BrowserRouter });

// ---
// 3. THE TESTS
// ---

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Basic Rendering
   * Checks if all key sections are present when the page loads.
   */
  test('renders home page sections correctly', () => {
    renderWithRouter(<Home />);

    // Check for hero section elements
    expect(screen.getByText(/home.hero.title/i)).toBeInTheDocument();
    expect(screen.getByText('home.hero.subtitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'home.hero.journey_button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.nav.login' })).toBeInTheDocument();

    // Check for mission section
    expect(screen.getByText('home.mission.title')).toBeInTheDocument();
    expect(screen.getByText('home.mission.subtitle')).toBeInTheDocument();
    expect(screen.getByText('home.mission.features.log.title')).toBeInTheDocument();

    // Check for tips section
    expect(screen.getByText('home.tips.title')).toBeInTheDocument();
    expect(screen.getByText(/home.tips.category_prefix/i)).toBeInTheDocument();

    // Check for rewards section
    expect(screen.getByText('home.rewards.title')).toBeInTheDocument();

    // Check for testimonials
    expect(screen.getByText('home.testimonials.title')).toBeInTheDocument();

    // Check for mocked components
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-info-box')).toBeInTheDocument();
  });


  /**
   * Test 2: Carousel Tip Rotation
   * Tests the useEffect interval for rotating eco-tips.
   */
  test('rotates through eco-tips with useEffect interval', async () => {
    // 1. Activate fake timers BEFORE rendering
    jest.useFakeTimers();

    renderWithRouter(<Home />);

    // 2. Check for the FIRST tip's actual text
    expect(screen.getByText('Mock tip 1')).toBeInTheDocument();

    // 3. Advance the timer INSIDE act()
    act(() => {
      jest.advanceTimersByTime(5000); // Advance 5 seconds
    });

    // 4. Wait for the component to re-render with the SECOND tip
    await waitFor(() => {
      expect(screen.getByText('Mock tip 2')).toBeInTheDocument();
    });

    // Clean up
    jest.useRealTimers();
  });
  /**
   * Test 3: Hero Button Clicks
   * Tests that buttons are clickable and links are mocked correctly.
   */
  test('hero buttons are clickable and navigate correctly', () => {
    renderWithRouter(<Home />);

    // Check buttons
    const journeyButton = screen.getByRole('button', { name: 'home.hero.journey_button' });
    const loginButton = screen.getByRole('button', { name: 'common.nav.login' });

    expect(journeyButton).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();

    // Simulate click (mocked links)
    fireEvent.click(journeyButton);
    fireEvent.click(loginButton);

    // Verify mocked links exist
    expect(screen.getByTestId('mock-link-/signup')).toBeInTheDocument();
    expect(screen.getByTestId('mock-link-/login')).toBeInTheDocument();
  });

  /**
   * Test 4: InfoBox Rendering (Mocked)
   * Tests that the InfoBox is rendered within the page.
   */
  test('renders InfoBox component', () => {
    renderWithRouter(<Home />);

    expect(screen.getByTestId('mock-info-box')).toBeInTheDocument();
  });
});