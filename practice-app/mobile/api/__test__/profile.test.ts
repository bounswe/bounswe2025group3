import { getMyScore } from '../waste';
import { getUserProfile, updateUserProfile, UpdateProfileData } from '../user';
import tokenManager from '@/services/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';

// Mock tokenManager
jest.mock('@/services/tokenManager', () => ({
  __esModule: true,
  default: {
    authenticatedFetch: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    saveTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

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

describe('getMyScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch score', async () => {
    const mockResponse = {
      total_score: 150,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getMyScore();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.WASTE.MY_SCORE);
    expect(result).toBe(150);
  });

  it('should handle error and throw', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getMyScore()).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getMyScore()).rejects.toThrow('Network error');
  });

  it('should handle authentication errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication required',
      }),
    });

    await expect(getMyScore()).rejects.toThrow();
  });
});

describe('getUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch user profile', async () => {
    const mockProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      bio: 'Test bio',
      city: 'Test City',
      country: 'Test Country',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    const result = await getUserProfile();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE);
    expect(result).toEqual(mockProfile);
  });

  it('should handle error and throw', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getUserProfile()).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getUserProfile()).rejects.toThrow('Network error');
  });

  it('should handle authentication errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication required',
      }),
    });

    await expect(getUserProfile()).rejects.toThrow();
  });
});

describe('updateUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update user profile', async () => {
    const profileData: UpdateProfileData = {
      first_name: 'Updated',
      last_name: 'Name',
      bio: 'Updated bio',
      city: 'New City',
      country: 'New Country',
    };

    const mockUpdatedProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      ...profileData,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedProfile,
    });

    const result = await updateUserProfile(profileData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    expect(result).toEqual(mockUpdatedProfile);
  });

  it('should handle partial updates', async () => {
    const partialData: UpdateProfileData = {
      first_name: 'Updated',
    };

    const mockUpdatedProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Updated',
      last_name: 'User',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedProfile,
    });

    const result = await updateUserProfile(partialData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData),
    });
    expect(result).toEqual(mockUpdatedProfile);
  });

  it('should handle validation errors', async () => {
    const profileData: UpdateProfileData = {
      first_name: 'A'.repeat(1000), // Too long
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        first_name: ['Ensure this field has no more than 150 characters.'],
      }),
    });

    await expect(updateUserProfile(profileData)).rejects.toThrow();
  });

  it('should handle authentication errors', async () => {
    const profileData: UpdateProfileData = {
      first_name: 'Test',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication required',
      }),
    });

    await expect(updateUserProfile(profileData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const profileData: UpdateProfileData = {
      first_name: 'Test',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(updateUserProfile(profileData)).rejects.toThrow('Network error');
  });

  it('should handle empty update data', async () => {
    const emptyData: UpdateProfileData = {};

    const mockProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    const result = await updateUserProfile(emptyData);

    expect(result).toEqual(mockProfile);
  });
});
