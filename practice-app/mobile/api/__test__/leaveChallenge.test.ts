import { leaveChallenge } from '../challenges';
import tokenManager from '@/services/tokenManager';

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

describe('leaveChallenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully leave a challenge', async () => {
    const mockFetchResponse = {
      ok: true,
      status: 204,
      json: async () => null,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await leaveChallenge(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      `/api/v1/challenges/api/v1/challenges/1/leave/`,
      {
        method: 'DELETE',
      }
    );
  });

  it('should handle not participating scenario', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 404,
      json: async () => ({
        error: 'You are not participating in this challenge.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(leaveChallenge(1)).rejects.toThrow(
      'You are not participating in this challenge.'
    );
  });

  it('should handle challenge not found', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Not found.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(leaveChallenge(999)).rejects.toThrow('Not found.');
  });

  it('should handle authentication errors', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication credentials were not provided.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(leaveChallenge(1)).rejects.toThrow(
      'Authentication credentials were not provided.'
    );
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(leaveChallenge(1)).rejects.toThrow('Network error');
  });

  it('should handle empty response body (204 No Content)', async () => {
    const mockFetchResponse = {
      ok: true,
      status: 204,
      json: async () => null,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(leaveChallenge(1)).resolves.not.toThrow();
  });
});

