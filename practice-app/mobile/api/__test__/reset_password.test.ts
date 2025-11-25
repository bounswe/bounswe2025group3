import { reset_password } from '../auth';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('reset_password', () => {
  const email = 'test@example.com';
  const resetUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.PASSWORD_RESET}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should successfully request password reset with valid email', async () => {
    const mockResponse = {
      message: 'Password reset email has been sent.',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await reset_password(email);

    expect(fetch).toHaveBeenCalledWith(resetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    expect(result).toEqual(mockResponse);
  });

  it('should throw error on invalid email', async () => {
    const invalidEmailError = {
      email: ['Enter a valid email address.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => invalidEmailError,
    });

    await expect(reset_password('invalid-email')).rejects.toThrow('Enter a valid email address.');
  });

  it('should throw error when email does not exist', async () => {
    const notFoundError = {
      error: 'No account found with this email address.',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => notFoundError,
    });

    await expect(reset_password('nonexistent@example.com')).rejects.toThrow('No account found with this email address.');
  });

  it('should handle network failures', async () => {
    const networkError = new Error('Network request failed');

    (fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(reset_password(email)).rejects.toThrow('Network request failed');
  });

  it('should handle server errors', async () => {
    const serverError = {
      error: 'Internal server error',
      status: 500,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => serverError,
    });

    await expect(reset_password(email)).rejects.toThrow('Internal server error');
  });

  it('should handle empty email', async () => {
    const emptyEmailError = {
      email: ['This field is required.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => emptyEmailError,
    });

    await expect(reset_password('')).rejects.toThrow('This field is required.');
  });
});

