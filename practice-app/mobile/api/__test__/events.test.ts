import {
  getEvents,
  getEventById,
  createEvent,
  likeEvent,
  participateEvent,
  Event,
  CreateEventData,
  LikeResponse,
  ParticipateResponse,
} from '../events';
import tokenManager from '@/services/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { fetchAllPages } from '../utils';

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

// Mock fetchAllPages
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  fetchAllPages: jest.fn(),
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

describe('getEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch events', async () => {
    const mockEvents: Event[] = [
      {
        id: 1,
        title: 'Beach Cleanup',
        description: 'Join us for a beach cleanup event',
        location: 'Sunset Beach',
        date: '2024-06-15T10:00:00Z',
        image: 'https://example.com/image1.jpg',
        creator: 1,
        creator_username: 'john_doe',
        participants_count: 25,
        likes_count: 50,
        i_am_participating: 'false',
        i_liked: 'false',
        created_at: '2024-05-01T10:00:00Z',
        updated_at: '2024-05-01T10:00:00Z',
      },
      {
        id: 2,
        title: 'Tree Planting',
        description: 'Help us plant trees in the park',
        location: 'Central Park',
        date: '2024-07-20T14:00:00Z',
        image: 'https://example.com/image2.jpg',
        creator: 2,
        creator_username: 'jane_smith',
        participants_count: 40,
        likes_count: 75,
        i_am_participating: 'true',
        i_liked: 'true',
        created_at: '2024-05-10T10:00:00Z',
        updated_at: '2024-05-10T10:00:00Z',
      },
    ];

    (fetchAllPages as jest.Mock).mockResolvedValueOnce(mockEvents);

    const result = await getEvents();

    expect(fetchAllPages).toHaveBeenCalledWith(API_ENDPOINTS.EVENTS.LIST);
    expect(result).toEqual(mockEvents);
  });

  it('should handle empty results', async () => {
    (fetchAllPages as jest.Mock).mockResolvedValueOnce([]);

    const result = await getEvents();

    expect(result).toEqual([]);
  });

  it('should handle errors and throw', async () => {
    const error = new Error('Network error');
    (fetchAllPages as jest.Mock).mockRejectedValueOnce(error);

    await expect(getEvents()).rejects.toThrow('Network error');
    expect(console.error).toHaveBeenCalledWith('Failed to get events', error);
  });

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch events');
    (fetchAllPages as jest.Mock).mockRejectedValueOnce(error);

    await expect(getEvents()).rejects.toThrow('Failed to fetch events');
  });
});

describe('getEventById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch event by id', async () => {
    const mockEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'https://example.com/image1.jpg',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 25,
      likes_count: 50,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvent,
    });

    const result = await getEventById(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.BY_ID(1)
    );
    expect(result).toEqual(mockEvent);
  });

  it('should handle event not found', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Event not found.',
      }),
    });

    await expect(getEventById(999)).rejects.toThrow();
  });

  it('should handle authentication errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication credentials were not provided.',
      }),
    });

    await expect(getEventById(1)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getEventById(1)).rejects.toThrow('Network error');
  });

  it('should handle malformed response', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    // When JSON parsing fails, parseJson throws the JSON error directly
    await expect(getEventById(1)).rejects.toThrow('Invalid JSON');
  });
});

describe('createEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create event without image', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
    };

    const mockCreatedEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: '',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 0,
      likes_count: 0,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedEvent,
    });

    const result = await createEvent(eventData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.CREATE,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(result).toEqual(mockCreatedEvent);
  });

  it('should successfully create event with image URL', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'https://example.com/image.jpg',
    };

    const mockCreatedEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'https://example.com/image.jpg',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 0,
      likes_count: 0,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedEvent,
    });

    const result = await createEvent(eventData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.CREATE,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(result).toEqual(mockCreatedEvent);
  });

  it('should successfully create event with local file URI', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'file:///path/to/image.jpg',
    };

    const mockCreatedEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'https://example.com/uploaded-image.jpg',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 0,
      likes_count: 0,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedEvent,
    });

    const result = await createEvent(eventData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.CREATE,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(result).toEqual(mockCreatedEvent);
  });

  it('should handle validation errors', async () => {
    const invalidData: CreateEventData = {
      title: '', // Empty title
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        title: ['This field may not be blank.'],
      }),
    });

    await expect(createEvent(invalidData)).rejects.toThrow();
  });

  it('should handle missing required fields', async () => {
    const incompleteData = {
      title: 'Beach Cleanup',
      // Missing description, location, date
    } as CreateEventData;

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        description: ['This field is required.'],
        location: ['This field is required.'],
        date: ['This field is required.'],
      }),
    });

    await expect(createEvent(incompleteData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(createEvent(eventData)).rejects.toThrow('Network error');
  });

  it('should handle server errors', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
      }),
    });

    await expect(createEvent(eventData)).rejects.toThrow();
  });

  it('should handle null image', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: null,
    };

    const mockCreatedEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: '',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 0,
      likes_count: 0,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedEvent,
    });

    const result = await createEvent(eventData);

    expect(result).toEqual(mockCreatedEvent);
  });

  it('should handle content:// URI scheme', async () => {
    const eventData: CreateEventData = {
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'content://media/external/images/media/123',
    };

    const mockCreatedEvent: Event = {
      id: 1,
      title: 'Beach Cleanup',
      description: 'Join us for a beach cleanup event',
      location: 'Sunset Beach',
      date: '2024-06-15T10:00:00Z',
      image: 'https://example.com/uploaded-image.jpg',
      creator: 1,
      creator_username: 'john_doe',
      participants_count: 0,
      likes_count: 0,
      i_am_participating: 'false',
      i_liked: 'false',
      created_at: '2024-05-01T10:00:00Z',
      updated_at: '2024-05-01T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedEvent,
    });

    const result = await createEvent(eventData);

    expect(result).toEqual(mockCreatedEvent);
  });
});

describe('likeEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully like an event', async () => {
    const mockResponse: LikeResponse = {
      likes_count: 51,
      i_liked: 'true',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await likeEvent(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.LIKE(1),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should successfully unlike an event', async () => {
    const mockResponse: LikeResponse = {
      likes_count: 50,
      i_liked: 'false',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await likeEvent(1);

    expect(result).toEqual(mockResponse);
    expect(result.i_liked).toBe('false');
  });

  it('should handle event not found', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Event not found.',
      }),
    });

    await expect(likeEvent(999)).rejects.toThrow();
  });

  it('should handle authentication errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication credentials were not provided.',
      }),
    });

    await expect(likeEvent(1)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(likeEvent(1)).rejects.toThrow('Network error');
  });

  it('should handle server errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
      }),
    });

    await expect(likeEvent(1)).rejects.toThrow();
  });
});

describe('participateEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully participate in an event', async () => {
    const mockResponse: ParticipateResponse = {
      participants_count: 26,
      i_am_participating: 'true',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await participateEvent(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.EVENTS.PARTICIPATE(1),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should successfully unparticipate from an event', async () => {
    const mockResponse: ParticipateResponse = {
      participants_count: 25,
      i_am_participating: 'false',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await participateEvent(1);

    expect(result).toEqual(mockResponse);
    expect(result.i_am_participating).toBe('false');
  });

  it('should handle event not found', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Event not found.',
      }),
    });

    await expect(participateEvent(999)).rejects.toThrow();
  });

  it('should handle authentication errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: 'Authentication credentials were not provided.',
      }),
    });

    await expect(participateEvent(1)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(participateEvent(1)).rejects.toThrow('Network error');
  });

  it('should handle server errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: 'Internal server error',
      }),
    });

    await expect(participateEvent(1)).rejects.toThrow();
  });

  it('should handle participation limit reached', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        detail: 'Event participation limit reached.',
      }),
    });

    await expect(participateEvent(1)).rejects.toThrow();
  });
});

