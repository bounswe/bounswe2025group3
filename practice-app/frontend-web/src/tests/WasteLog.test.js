import React from 'react';
import { render, screen } from '@testing-library/react';
import WasteLog from '../components/waste/WasteLog';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// --- MOCK EXTERNAL DEPENDENCIES ---
// Navbar mock
jest.mock('../components/common/Navbar', () => () => <div data-testid="mock-navbar">Navbar</div>);

// i18n mock
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // sadece key döndür
  }),
}));

// API mock yapmaya gerek yok, hiçbir fetch kullanmayacağız


// --- HELPER FUNCTION ---
const renderComponent = () =>
  render(
    <BrowserRouter>
      <WasteLog />
    </BrowserRouter>
  );

// --- TESTS ---
describe('WasteLog Component - Minimal Render Test', () => {
  test('renders without crashing', () => {
    renderComponent();

    // Navbar render edildi mi?
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();

    // Bazı temel metinler render edildi mi?
    expect(screen.getByText('waste_log_page.title')).toBeInTheDocument();
    expect(screen.getByText('waste_log_page.form.category_label')).toBeInTheDocument();
    expect(screen.getByText('waste_log_page.form.submit_button')).toBeInTheDocument();
  });
});
