import tokenManager from '../tokenManager';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('TokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset SecureStore mocks
    (SecureStore.getItemAsync as jest.Mock).mockReset();
    (SecureStore.setItemAsync as jest.Mock).mockReset();
    (SecureStore.deleteItemAsync as jest.Mock).mockReset();
    (fetch as jest.Mock).mockReset();
    
    // Default SecureStore responses
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('saveTokens', () => {
    it('should save tokens to SecureStore', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      await tokenManager.saveTokens(accessToken, refreshToken);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', accessToken);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', refreshToken);
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from SecureStore', async () => {
      const accessToken = 'access-token-123';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(accessToken);

      const result = await tokenManager.getAccessToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
      expect(result).toBe(accessToken);
    });

    it('should return null when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await tokenManager.getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from SecureStore', async () => {
      const refreshToken = 'refresh-token-456';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      const result = await tokenManager.getRefreshToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(result).toBe(refreshToken);
    });

    it('should return null when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await tokenManager.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should delete both tokens from SecureStore', async () => {
      await tokenManager.clearTokens();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasValidTokens', () => {
    it('should return true when both tokens exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await tokenManager.hasValidTokens();

      expect(result).toBe(true);
    });

    it('should return false when access token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('refresh-token');

      const result = await tokenManager.hasValidTokens();

      expect(result).toBe(false);
    });

    it('should return false when refresh token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce(null);

      const result = await tokenManager.hasValidTokens();

      expect(result).toBe(false);
    });

    it('should return false when both tokens are missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await tokenManager.hasValidTokens();

      expect(result).toBe(false);
    });
  });

  describe('autoLogin', () => {
    it('should return false when no tokens exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await tokenManager.autoLogin();

      expect(result).toBe(false);
    });

    it('should return false when access token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('refresh-token');

      const result = await tokenManager.autoLogin();

      expect(result).toBe(false);
    });

    it('should return false when refresh token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce(null);

      const result = await tokenManager.autoLogin();

      expect(result).toBe(false);
    });

    it('should return true on successful auto-login', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token') // autoLogin checks access token
        .mockResolvedValueOnce('refresh-token') // autoLogin checks refresh token
        .mockResolvedValueOnce('access-token'); // authenticatedFetch gets access token

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await tokenManager.autoLogin();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.TEST_PROTECTED}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
          }),
        })
      );
    });

    it('should return false on failed auto-login with invalid tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('invalid-access-token')
        .mockResolvedValueOnce('refresh-token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await tokenManager.autoLogin();

      expect(result).toBe(false);
    });

    it('should return false when API call throws error', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await tokenManager.autoLogin();

      expect(result).toBe(false);
    });
  });

  describe('authenticatedFetch', () => {
    it('should make successful authenticated request', async () => {
      const accessToken = 'access-token-123';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(accessToken);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: 'test' }),
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await tokenManager.authenticatedFetch('/api/test');

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/test`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should include custom headers in request', async () => {
      const accessToken = 'access-token-123';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(accessToken);

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
      };

      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await tokenManager.authenticatedFetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ test: 'data' }),
      });
      expect(result.ok).toBe(true);
    });

    it('should throw error when no access token found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await expect(tokenManager.authenticatedFetch('/api/test')).rejects.toThrow(
        'No access token found, User must log in.'
      );
    });

    it('should refresh token on 401 error and retry request', async () => {
      const oldAccessToken = 'old-access-token';
      const refreshToken = 'refresh-token';
      const newAccessToken = 'new-access-token';

      // Setup SecureStore mocks in order of calls
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(oldAccessToken) // authenticatedFetch gets access token
        .mockResolvedValueOnce(refreshToken); // refreshAccessToken gets refresh token

      // First request returns 401
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      // Refresh succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access: newAccessToken,
          refresh: 'new-refresh-token',
        }),
      });

      // Retry request with new token
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
      };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await tokenManager.authenticatedFetch('/api/test');

      // Should have called refresh endpoint
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        })
      );

      // Should have retried with new token
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/test`, {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should handle concurrent requests during token refresh', async () => {
      const oldAccessToken = 'old-access-token';
      const refreshToken = 'refresh-token';
      const newAccessToken = 'new-access-token';

      // Setup SecureStore mocks - both requests will get old token first
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(oldAccessToken) // First authenticatedFetch
        .mockResolvedValueOnce(oldAccessToken) // Second authenticatedFetch (concurrent)
        .mockResolvedValueOnce(refreshToken); // refreshAccessToken

      // Both requests return 401
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // First request
        .mockResolvedValueOnce({ ok: false, status: 401 }); // Second request (but refresh happens first)

      // Refresh succeeds
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access: newAccessToken,
          refresh: 'new-refresh-token',
        }),
      });

      // Retry requests with new token
      const mockResponse1 = { ok: true, status: 200 };
      const mockResponse2 = { ok: true, status: 200 };
      (fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse1) // First request retry
        .mockResolvedValueOnce(mockResponse2); // Second request retry

      // Make two concurrent requests
      const promise1 = tokenManager.authenticatedFetch('/api/test1');
      const promise2 = tokenManager.authenticatedFetch('/api/test2');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should succeed with new token
      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);

      // Refresh should only be called once
      const refreshCalls = (fetch as jest.Mock).mock.calls.filter(
        (call) => call[0] === `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`
      );
      expect(refreshCalls.length).toBe(1);
    });

    it('should throw error when refresh fails', async () => {
      const oldAccessToken = 'old-access-token';
      const refreshToken = 'refresh-token';

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(oldAccessToken) // authenticatedFetch gets access token
        .mockResolvedValueOnce(refreshToken); // refreshAccessToken gets refresh token

      // First request returns 401
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Refresh fails with server error
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

      await expect(tokenManager.authenticatedFetch('/api/test')).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });

    it('should throw error when refresh returns no new token', async () => {
      const oldAccessToken = 'old-access-token';
      const refreshToken = 'refresh-token';

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(oldAccessToken) // authenticatedFetch gets access token
        .mockResolvedValueOnce(refreshToken); // refreshAccessToken gets refresh token

      // First request returns 401
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      // Refresh succeeds but returns null/undefined access token (falsy value)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access: null, // This will cause refreshAccessToken to return null
          refresh: 'new-refresh-token',
        }),
      });

      await expect(tokenManager.authenticatedFetch('/api/test')).rejects.toThrow(
        'Session expired. Please log in again.'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh token', async () => {
      const refreshToken = 'refresh-token-123';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          access: newAccessToken,
          refresh: newRefreshToken,
        }),
      });

      const result = await tokenManager.refreshAccessToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', newAccessToken);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', newRefreshToken);
      expect(result).toBe(newAccessToken);
    });

    it('should throw error when no refresh token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow('No refresh token found');
      
      // Should not make any fetch calls
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when refresh request fails', async () => {
      const refreshToken = 'refresh-token-123';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      });

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow(
        'Token refresh failed on the server.'
      );
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should clear tokens on refresh failure', async () => {
      const refreshToken = 'refresh-token-123';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Network error');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });

    it('should clear tokens when refresh returns error response', async () => {
      const refreshToken = 'refresh-token-123';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow(
        'Token refresh failed on the server.'
      );

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });

    it('should handle network errors during refresh', async () => {
      const refreshToken = 'refresh-token-123';

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Network error');
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });
  });
});

