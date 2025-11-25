import { getChallenges, ChallengeListResponse } from '../challenges';
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

describe('getChallenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch challenges', async () => {
    const mockResponse: ChallengeListResponse = {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Test Challenge 1',
          description: 'Description 1',
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
        },
        {
          id: 2,
          name: 'Test Challenge 2',
          description: 'Description 2',
          goal_quantity: '50',
          unit: 'items',
          target_category: null,
          target_subcategory: 2,
          start_date: '2024-02-01',
          end_date: '2024-02-28',
          entry_type: 'team',
          template: 1,
          creator: 2,
          created_at: '2024-02-01T00:00:00Z',
          participants_count: 5,
        },
      ],
    };

    const mockFetchResponse = {
      ok: true,
      json: async () => mockResponse,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    const result = await getChallenges();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(CHALLENGES_ENDPOINT);
    expect(result).toEqual(mockResponse);
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

    await expect(getChallenges()).rejects.toThrow('Authentication credentials were not provided.');
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getChallenges()).rejects.toThrow('Network error');
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
    const result = await getChallenges();
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
    await expect(getChallenges()).rejects.toThrow('Failed to load challenges.');
  });

  it('should use authentication token via authenticatedFetch', async () => {
    const mockResponse: ChallengeListResponse = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    const mockFetchResponse = {
      ok: true,
      json: async () => mockResponse,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse);

    await getChallenges();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalled();
  });
});

