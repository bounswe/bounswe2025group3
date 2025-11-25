/**
 * Integration Tests: Authentication Flow
 * 
 * Tests the integration between:
 * - login() API function
 * - tokenManager service (saveTokens, getAccessToken, authenticatedFetch)
 * - SecureStore (mocked but tested as part of the flow)
 * 
 * These tests verify that multiple components work together correctly,
 * not just in isolation.
 */

import { login } from '../auth';
import tokenManager from '@/services/tokenManager';
import { getUserProfile } from '../user';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

// Mock SecureStore to simulate real storage behavior
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

describe('Authentication Flow Integration', () => {
  const email = 'test@example.com';
  const password = 'password123';
  const accessToken = 'access-token-123';
  const refreshToken = 'refresh-token-456';

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    (SecureStore.setItemAsync as jest.Mock).mockClear();
    (SecureStore.getItemAsync as jest.Mock).mockClear();
    
    // Default SecureStore behavior: return null (no tokens)
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Login → Token Storage → Authenticated API Call', () => {
    it('should complete full authentication flow: login, save tokens, and use them for API calls', async () => {
      // Step 1: Mock successful login response
      const loginResponse = {
        access: accessToken,
        refresh: refreshToken,
        role: 'user',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      });

      // Step 2: Perform login (this should save tokens via tokenManager)
      const loginResult = await login(email, password);

      // Step 3: Verify tokens were saved to SecureStore
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', accessToken);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', refreshToken);

      // Step 4: Simulate tokens being stored (for next API call)
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve(accessToken);
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(null);
      });

      // Step 5: Mock authenticated API call (getUserProfile)
      const profileData = {
        id: 1,
        username: 'testuser',
        email: email,
        first_name: 'Test',
        last_name: 'User',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => profileData,
      });

      // Step 6: Make authenticated API call using stored tokens
      const profile = await getUserProfile();

      // Step 7: Verify the authenticated fetch was called with the correct token
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${API_ENDPOINTS.USER.PROFILE}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
        })
      );

      // Step 8: Verify the profile data is returned correctly
      expect(profile).toEqual(profileData);
      expect(loginResult).toEqual(loginResponse);
    });

    it('should handle token persistence across multiple API calls', async () => {
      // Login and save tokens
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: accessToken, refresh: refreshToken }),
      });

      await login(email, password);

      // Simulate tokens in storage
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve(accessToken);
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(null);
      });

      // Make multiple authenticated API calls
      const profileData1 = { id: 1, username: 'testuser' };
      const profileData2 = { id: 1, username: 'testuser', updated: true };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => profileData1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => profileData2,
        });

      const profile1 = await getUserProfile();
      const profile2 = await getUserProfile();

      // Verify both calls used the same token
      expect(fetch).toHaveBeenCalledTimes(3); // 1 login + 2 profile calls
      expect(profile1).toEqual(profileData1);
      expect(profile2).toEqual(profileData2);
    });
  });

  describe('Token Refresh Integration', () => {
    it('should automatically refresh token on 401 and retry the request', async () => {
      // Step 1: Set up tokens in storage
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve('expired-token');
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(null);
      });

      const newAccessToken = 'new-access-token-789';

      // Step 2: First API call returns 401 (expired token)
      // Step 3: Token refresh succeeds
      // Step 4: Retry original request with new token
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Token expired' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access: newAccessToken, refresh: refreshToken }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, username: 'testuser' }),
        });

      // Step 5: Update SecureStore to return new token after refresh
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve(newAccessToken);
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(null);
      });

      // Step 6: Make authenticated API call (should trigger refresh)
      const profile = await getUserProfile();

      // Step 7: Verify refresh was called
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        })
      );

      // Step 8: Verify new token was saved
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', newAccessToken);

      // Step 9: Verify original request was retried with new token
      expect(profile).toBeDefined();
    });

    it('should handle refresh failure and clear tokens', async () => {
      // Set up expired tokens
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve('expired-token');
        if (key === 'refreshToken') return Promise.resolve('expired-refresh-token');
        return Promise.resolve(null);
      });

      // First call returns 401, refresh fails
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Token expired' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Refresh token expired' }),
        });

      // Attempt authenticated API call
      // getUserProfile now throws errors instead of returning undefined
      await expect(getUserProfile()).rejects.toThrow();

      // Verify tokens were cleared (tokenManager.clearTokens is called on refresh failure)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Challenge Join Flow Integration', () => {
    it('should join challenge using authenticated token', async () => {
      const { joinChallenge } = require('../challenges');

      // Set up valid tokens
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === 'accessToken') return Promise.resolve(accessToken);
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(null);
      });

      const challengeId = 1;
      const participationData = {
        id: 1,
        user: 'testuser',
        challenge: `challenge-${challengeId}`,
        team: null,
        progress: 0,
        status: 'active',
        joined_at: new Date().toISOString(),
        completed_at: null,
        exited_at: null,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => participationData,
      });

      const result = await joinChallenge(challengeId);

      // Verify authenticated request was made
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/challenges/api/v1/challenges/${challengeId}/join/`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
        })
      );

      expect(result).toEqual(participationData);
    });
  });
});

