// Mock dependencies before importing the module
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

global.fetch = jest.fn();

// Import after mocking
import TokenManager from '@/app/tokenManager';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';

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
  });

  describe('clearTokens', () => {
    it('should clear tokens from secure store', async () => {
      await TokenManager.clearTokens();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });
  });
}); 