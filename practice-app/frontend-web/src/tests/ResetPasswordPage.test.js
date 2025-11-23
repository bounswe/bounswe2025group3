import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from '../components/auth/ResetPasswordPage';

jest.mock('axios');

describe('ResetPasswordPage Component', () => {
  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/reset/uid123/token456']}>
        <Routes>
          <Route path="/reset/:uid/:token" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

  test('renders form fields', () => {
    renderComponent();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  test('validates password mismatch', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'mismatch' } });
    fireEvent.click(screen.getByText('Reset Password'));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  test('validates short password', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Reset Password'));

    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
  });

  test('submits new password successfully', async () => {
    axios.post.mockResolvedValue({});
    renderComponent();

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newPass123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newPass123' } });
    fireEvent.click(screen.getByText('Reset Password'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/password_reset_confirm/uid123/token456/'),
        expect.objectContaining({
          new_password1: 'newPass123',
          new_password2: 'newPass123'
        })
      );
      expect(screen.getByText(/Your password has been successfully reset/i)).toBeInTheDocument();
    });
  });
});