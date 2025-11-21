import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsPage from '../components/auth/TermsPage';

describe('TermsPage Component', () => {
  test('renders terms and conditions content', () => {
    render(<TermsPage />);
    
    // Check for the hardcoded HTML content injected via dangerouslySetInnerHTML
    expect(screen.getByText('TERMS AND CONDITIONS')).toBeInTheDocument();
    expect(screen.getByText('AGREEMENT TO OUR LEGAL TERMS')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
  });
});