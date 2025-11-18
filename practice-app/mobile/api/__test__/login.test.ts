import { login } from '../auth';
import tokenManager from '@/services/tokenManager';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock tokenManager
jest.mock('@/services/tokenManager', () => ({
  __esModule: true,
  default: {
    saveTokens: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

// Mock console methods to avoid noise in test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('login', () => {
  const email = 'test@example.com';
  const password = 'password123';
  const loginUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (tokenManager.saveTokens as jest.Mock).mockClear();
  });

  it('should successfully login with valid credentials', async () => {
    const mockResponse = {
      access: 'access-token-123',
      refresh: 'refresh-token-456',
      role: 'user',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await login(email, password);

    expect(fetch).toHaveBeenCalledWith(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    expect(tokenManager.saveTokens).toHaveBeenCalledWith(
      'access-token-123',
      'refresh-token-456'
    );

    expect(result).toEqual(mockResponse);
  });

  it('should save tokens after successful login', async () => {
    const mockResponse = {
      access: 'new-access-token',
      refresh: 'new-refresh-token',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await login(email, password);

    expect(tokenManager.saveTokens).toHaveBeenCalledTimes(1);
    expect(tokenManager.saveTokens).toHaveBeenCalledWith(
      'new-access-token',
      'new-refresh-token'
    );
  });

  it('should throw error on failed login with invalid credentials', async () => {
    const errorResponse = {
      message: 'Invalid credentials',
      error: 'Authentication failed',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => errorResponse,
    });

    await expect(login(email, 'wrongpassword')).rejects.toThrow('Invalid credentials');

    expect(fetch).toHaveBeenCalledWith(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' }),
    });

    expect(tokenManager.saveTokens).not.toHaveBeenCalled();
  });

  it('should handle network failures', async () => {
    const networkError = new Error('Network request failed');

    (fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(login(email, password)).rejects.toThrow('Network request failed');

    expect(tokenManager.saveTokens).not.toHaveBeenCalled();
  });

  it('should handle API error responses', async () => {
    const errorResponse = {
      error: 'User account is disabled',
      status: 403,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => errorResponse,
    });

    await expect(login(email, password)).rejects.toThrow('User account is disabled');

    expect(tokenManager.saveTokens).not.toHaveBeenCalled();
  });

  it('should handle malformed JSON responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(login(email, password)).rejects.toThrow('Invalid JSON');
  });
});

