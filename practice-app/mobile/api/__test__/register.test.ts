import { register } from '../auth';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to avoid noise in test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('register', () => {
  const username = 'testuser';
  const email = 'test@example.com';
  const password = 'password123';
  const password2 = 'password123';
  const registerUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should successfully register with valid data', async () => {
    const mockResponse = {
      message: 'User registered successfully',
      user: {
        id: 1,
        username,
        email,
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await register(username, email, password, password2);

    expect(fetch).toHaveBeenCalledWith(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, password2 }),
    });

    expect(result).toEqual(mockResponse);
  });

  it('should throw error on invalid email', async () => {
    const emailValidationError = {
      email: ['Enter a valid email address.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => emailValidationError,
    });

    await expect(
      register(username, 'invalid-email', password, password2)
    ).rejects.toThrow('Enter a valid email address.');
  });

  it('should throw error on short password', async () => {
    const passwordValidationError = {
      password: ['This password is too short. It must contain at least 8 characters.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => passwordValidationError,
    });

    await expect(
      register(username, email, 'short', 'short')
    ).rejects.toThrow('This password is too short. It must contain at least 8 characters.');
  });

  it('should throw error on duplicate email', async () => {
    const duplicateError = {
      email: ['A user with this email already exists.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => duplicateError,
    });

    await expect(register(username, email, password, password2)).rejects.toThrow('A user with this email already exists.');
  });

  it('should throw error on duplicate username', async () => {
    const duplicateError = {
      username: ['A user with this username already exists.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => duplicateError,
    });

    await expect(register(username, email, password, password2)).rejects.toThrow('A user with this username already exists.');
  });

  it('should throw error on password mismatch', async () => {
    const passwordMismatchError = {
      password2: ['Password fields did not match.'],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => passwordMismatchError,
    });

    await expect(register(username, email, password, 'different-password')).rejects.toThrow('Password fields did not match.');
  });

  it('should handle network failures during registration', async () => {
    const networkError = new Error('Network request failed');

    (fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(register(username, email, password, password2)).rejects.toThrow(
      'Network request failed'
    );
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

    await expect(register(username, email, password, password2)).rejects.toThrow('Internal server error');
  });
});

