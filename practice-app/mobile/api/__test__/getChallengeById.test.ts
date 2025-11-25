import { getChallengeById, Challenge } from '../challenges';
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

const CHALLENGES_ENDPOINT = '/api/v1/challenges/api/v1/challenges/';

describe('getChallengeById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch challenge by ID', async () => {
    const mockChallenge: Challenge = {
      id: 1,
      name: 'Test Challenge',
      description: 'Test Description',
      goal_quantity: '100',
      unit: 'kg',
      target_category: 1,
      target_subcategory: null,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      entry_type: 'individual',
      template: null,
      creator: 1,
      created_at: '2024-01-01T00:00:00Z',
      participants_count: 10,
    };

    const mockFetchResponse = {
      ok: true,
      json: async () => mockChallenge,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    const result = await getChallengeById(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(`${CHALLENGES_ENDPOINT}1/`);
    expect(result).toEqual(mockChallenge);
  });

  it('should handle invalid ID (404 error)', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Not found.',
      }),
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await expect(getChallengeById(999)).rejects.toThrow('Not found.');
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

    await expect(getChallengeById(1)).rejects.toThrow(
      'Authentication credentials were not provided.'
    );
  });

  it('should handle malformed JSON responses with ok status', async () => {
    const mockFetchResponse = {
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    // When JSON parsing fails but response.ok is true, parseJson returns null
    const result = await getChallengeById(1);
    expect(result).toBeNull();
  });

  it('should handle malformed JSON responses with error status', async () => {
    const mockFetchResponse = {
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    // When JSON parsing fails and response.ok is false, parseJson throws fallback message
    await expect(getChallengeById(1)).rejects.toThrow('Failed to load challenge details.');
  });
});

