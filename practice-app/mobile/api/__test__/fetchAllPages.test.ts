import { fetchAllPages } from '../utils';
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

// Mock console methods
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('fetchAllPages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle single page response', async () => {
    const mockData = {
      results: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchAllPages<{ id: number; name: string }>('/api/items/');

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith('/api/items/');
    expect(result).toEqual(mockData.results);
  });

  it('should handle multi-page pagination', async () => {
    const page1Data = {
      results: [{ id: 1, name: 'Item 1' }],
      next: 'https://api.example.com/api/items/?page=2',
    };

    const page2Data = {
      results: [{ id: 2, name: 'Item 2' }],
      next: 'https://api.example.com/api/items/?page=3',
    };

    const page3Data = {
      results: [{ id: 3, name: 'Item 3' }],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Data,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2Data,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page3Data,
      });

    const result = await fetchAllPages<{ id: number; name: string }>('/api/items/');

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledTimes(3);
    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(1, '/api/items/');
    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(
      2,
      '/api/items/?page=2'
    );
    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(
      3,
      '/api/items/?page=3'
    );
    expect(result).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ]);
  });

  it('should extract URL path from full URL in next field', async () => {
    const page1Data = {
      results: [{ id: 1 }],
      next: 'https://ecochallenge-backend.onrender.com/api/items/?page=2&limit=10',
    };

    const page2Data = {
      results: [{ id: 2 }],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Data,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2Data,
      });

    await fetchAllPages<{ id: number }>('/api/items/');

    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(
      2,
      '/api/items/?page=2&limit=10'
    );
  });

  it('should handle relative URL in next field', async () => {
    const page1Data = {
      results: [{ id: 1 }],
      next: '/api/items/?page=2',
    };

    const page2Data = {
      results: [{ id: 2 }],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Data,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2Data,
      });

    await fetchAllPages<{ id: number }>('/api/items/');

    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(2, '/api/items/?page=2');
  });

  it('should handle invalid URL in next field gracefully', async () => {
    const page1Data = {
      results: [{ id: 1 }],
      next: 'invalid-url',
    };

    const page2Data = {
      results: [{ id: 2 }],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Data,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2Data,
      });

    await fetchAllPages<{ id: number }>('/api/items/');

    // Should use the invalid URL as-is when URL parsing fails
    expect(tokenManager.authenticatedFetch).toHaveBeenNthCalledWith(2, 'invalid-url');
  });

  it('should handle error during pagination', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(fetchAllPages<{ id: number }>('/api/items/')).rejects.toThrow(
      'Pagination request failed with status 500'
    );
  });

  it('should handle missing results array in response', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        next: null,
      }),
    });

    await expect(fetchAllPages<{ id: number }>('/api/items/')).rejects.toThrow(
      "Response missing 'results' array — unexpected format."
    );
  });

  it('should handle empty results', async () => {
    const mockData = {
      results: [],
      next: null,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchAllPages<{ id: number }>('/api/items/');

    expect(result).toEqual([]);
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(fetchAllPages<{ id: number }>('/api/items/')).rejects.toThrow('Network error');
  });

  it('should handle error in middle of pagination', async () => {
    const page1Data = {
      results: [{ id: 1 }],
      next: '/api/items/?page=2',
    };

    (tokenManager.authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1Data,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

    await expect(fetchAllPages<{ id: number }>('/api/items/')).rejects.toThrow(
      'Pagination request failed with status 404'
    );
  });
});
