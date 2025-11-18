import { joinChallenge, ChallengeParticipation } from '../challenges';
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

describe('joinChallenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully join a challenge', async () => {
    const mockParticipation: ChallengeParticipation = {
      id: 1,
      user: 'user@example.com',
      challenge: '1',
      team: null,
      progress: 0,
      status: 'active',
      joined_at: '2024-01-15T10:00:00Z',
      completed_at: null,
      exited_at: null,
    };

    const mockFetchResponse = {
      ok: true,
      json: async () => mockParticipation,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    const result = await joinChallenge(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      `/api/v1/challenges/api/v1/challenges/1/join/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    expect(result).toEqual(mockParticipation);
  });

  it('should handle already joined scenario', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 400,
      json: async () => ({
        error: 'You are already participating in this challenge.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(joinChallenge(1)).rejects.toThrow(
      'You are already participating in this challenge.'
    );
  });

  it('should handle permission errors', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 403,
      json: async () => ({
        detail: 'You do not have permission to perform this action.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(joinChallenge(1)).rejects.toThrow(
      'You do not have permission to perform this action.'
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

    await expect(joinChallenge(999)).rejects.toThrow('Not found.');
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(joinChallenge(1)).rejects.toThrow('Network error');
  });
});

