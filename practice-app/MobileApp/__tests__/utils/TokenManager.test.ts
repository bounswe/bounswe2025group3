import TokenManager from '@/app/tokenManager';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('TokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTokens', () => {
    it('should save tokens to secure store', async () => {
      await TokenManager.saveTokens('access-token', 'refresh-token');
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token from secure store', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
      
      const token = await TokenManager.getAccessToken();
      
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('accessToken');
      expect(token).toBe('access-token');
    });
  });

  describe('hasValidTokens', () => {
    it('should return true when both tokens exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await TokenManager.hasValidTokens();
      
      expect(result).toBe(true);
    });

    it('should return false when access token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('refresh-token');
      
      const result = await TokenManager.hasValidTokens();
      
      expect(result).toBe(false);
    });

    it('should return false when refresh token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce(null);
      
      const result = await TokenManager.hasValidTokens();
      
      expect(result).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Mock refresh token
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('refresh-token');
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access: 'new-access-token',
          refresh: 'new-refresh-token',
        }),
      });
      
      const result = await TokenManager.refreshAccessToken();
      
      // Verify API call
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/token/refresh/`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh: 'refresh-token' }),
        })
      );
      
      // Verify tokens were saved
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      
      // Verify return value
      expect(result).toBe('new-access-token');
    });

    it('should throw error when refresh token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      await expect(TokenManager.refreshAccessToken()).rejects.toThrow('No refresh token found');
    });

    it('should throw error when API call fails', async () => {
      // Mock refresh token
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('refresh-token');
      
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          detail: 'Invalid token',
        }),
      });
      
      await expect(TokenManager.refreshAccessToken()).rejects.toThrow('Invalid token');
      
      // Verify tokens were cleared
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens from secure store', async () => {
      await TokenManager.clearTokens();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('getUserRoleFromToken', () => {
    it('should extract role from token payload', async () => {
      // Mock access token with role in payload
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
      
      const role = await TokenManager.getUserRoleFromToken();
      
      expect(role).toBe('ADMIN');
    });

    it('should return null when token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      const role = await TokenManager.getUserRoleFromToken();
      
      expect(role).toBeNull();
    });
  });
}); 