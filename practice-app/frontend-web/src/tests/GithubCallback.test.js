import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GithubCallback from '../components/auth/GithubCallback';

// Mock axios
jest.mock('axios');

// Mock router
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

// Helper to setup localStorage mock
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
    },
    writable: true,
  });
});

describe('GithubCallback Component', () => {
  
  test('displays error if no code provided in URL', () => {
    // Mock URL without code
    delete window.location;
    window.location = { search: '' };

    render(<GithubCallback />);
    expect(screen.getByText('No code found in URL.')).toBeInTheDocument();
  });

  test('exchanges code for token successfully', async () => {
    // Mock URL with code
    delete window.location;
    window.location = { search: '?code=mock_github_code' };

    // Mock API success
    axios.post.mockResolvedValue({
      data: {
        access: 'gh_access',
        refresh: 'gh_refresh',
        user_id: 999,
        email: 'gh@test.com',
        role: 'user'
      }
    });

    render(<GithubCallback />);

    expect(screen.getByText('Logging in with GitHub...')).toBeInTheDocument();

    await waitFor(() => {
      // Verify API call
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/github/'),
        { code: 'mock_github_code' }
      );

      // Verify localStorage set
      expect(window.localStorage.setItem).toHaveBeenCalledWith('access_token', 'gh_access');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user_id', 999);

      // Verify redirect
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles API failure during exchange', async () => {
    window.location = { search: '?code=bad_code' };
    axios.post.mockRejectedValue({ response: { data: { error: 'Invalid code' } } });

    render(<GithubCallback />);

    await waitFor(() => {
      expect(screen.getByText('GitHub login failed: Invalid code')).toBeInTheDocument();
    });
  });
});