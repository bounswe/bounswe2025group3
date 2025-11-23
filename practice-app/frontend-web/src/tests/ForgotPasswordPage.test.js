import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../components/auth/ForgotPasswordPage';

jest.mock('axios');
jest.mock('../components/common/Header', () => () => <div>Header</div>);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('ForgotPasswordPage Component', () => {
  test('validates empty email', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'forgot_password.button_send_link' }));

    expect(screen.getByText('forgot_password.error_enter_email')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('sends reset link successfully', async () => {
    axios.post.mockResolvedValue({});
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('forgot_password.email_label'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'forgot_password.button_send_link' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/password_reset/'),
        { email: 'user@example.com' }
      );
      expect(screen.getByText('forgot_password.success_message')).toBeInTheDocument();
    });
  });
});