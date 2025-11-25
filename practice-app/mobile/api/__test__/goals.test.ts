import {
  getGoals,
  getGoalTemplates,
  createGoal,
  createGoalFromTemplate,
  Goal,
  CreateGoalData,
} from '../goals';
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

describe('getGoals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch goals', async () => {
    const mockGoals: Goal[] = [
      {
        id: 1,
        category: {
          id: 1,
          name: 'Plastic Bottles',
          category: 1,
          description: 'Plastic bottles',
          score_per_unit: '10',
          unit: 'bottle',
          is_active: true,
        },
        timeframe: 'weekly',
        target: 10,
        progress: 5,
        is_complete: false,
        created_at: '2024-01-15T10:00:00Z',
        start_date: '2024-01-15',
        status: 'active',
      },
    ];

    // Mock paginated response
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: mockGoals,
        next: null,
      }),
    });

    const result = await getGoals();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.GOALS.LIST);
    expect(result).toEqual(mockGoals);
  });

  it('should handle errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getGoals()).rejects.toThrow();
  });

  it('should handle empty results', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        next: null,
      }),
    });

    const result = await getGoals();

    expect(result).toEqual([]);
  });
});

describe('getGoalTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch goal templates', async () => {
    const mockTemplates = [
      {
        id: 1,
        name: 'Weekly Plastic Reduction',
        description: 'Reduce plastic usage weekly',
        category_name: 'Plastic',
        target: 10,
        timeframe: 'weekly',
      },
      {
        id: 2,
        name: 'Monthly Recycling Goal',
        description: 'Recycle more items monthly',
        category_name: 'Recycling',
        target: 50,
        timeframe: 'monthly',
      },
    ];

    // Mock paginated response
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: mockTemplates,
        next: null,
      }),
    });

    const result = await getGoalTemplates();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.GOALS.TEMPLATES);
    expect(result).toEqual(mockTemplates);
  });

  it('should handle errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getGoalTemplates()).rejects.toThrow();
  });

  it('should handle empty results', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        next: null,
      }),
    });

    const result = await getGoalTemplates();

    expect(result).toEqual([]);
  });
});

describe('createGoal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create goal', async () => {
    const goalData: CreateGoalData = {
      user: 1,
      category_id: 1,
      timeframe: 'weekly',
      target: 10,
      start_date: '2024-01-15',
      status: 'active',
    };

    const mockCreatedGoal: Goal = {
      id: 1,
      category: {
        id: 1,
        name: 'Plastic Bottles',
        category: 1,
        description: 'Plastic bottles',
        score_per_unit: '10',
        unit: 'bottle',
        is_active: true,
      },
      timeframe: 'weekly',
      target: 10,
      progress: 0,
      is_complete: false,
      created_at: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15',
      status: 'active',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedGoal,
    });

    const result = await createGoal(goalData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.GOALS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    expect(result).toEqual(mockCreatedGoal);
  });

  it('should handle validation errors', async () => {
    const invalidData: CreateGoalData = {
      user: 1,
      category_id: 1,
      timeframe: 'invalid' as any, // Invalid timeframe
      target: -5, // Invalid negative target
      start_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        timeframe: ['Invalid timeframe. Must be daily, weekly, or monthly.'],
        target: ['Target must be greater than 0.'],
      }),
    });

    await expect(createGoal(invalidData)).rejects.toThrow();
  });

  it('should handle missing required fields', async () => {
    const incompleteData = {
      user: 1,
    } as CreateGoalData;

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        category_id: ['This field is required.'],
        timeframe: ['This field is required.'],
        target: ['This field is required.'],
        start_date: ['This field is required.'],
      }),
    });

    await expect(createGoal(incompleteData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const goalData: CreateGoalData = {
      user: 1,
      category_id: 1,
      timeframe: 'weekly',
      target: 10,
      start_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(createGoal(goalData)).rejects.toThrow('Network error');
  });

  it('should handle optional status field', async () => {
    const goalData: CreateGoalData = {
      user: 1,
      category_id: 1,
      timeframe: 'weekly',
      target: 10,
      start_date: '2024-01-15',
      // status is optional
    };

    const mockCreatedGoal: Goal = {
      id: 1,
      category: {
        id: 1,
        name: 'Plastic Bottles',
        category: 1,
        description: 'Plastic bottles',
        score_per_unit: '10',
        unit: 'bottle',
        is_active: true,
      },
      timeframe: 'weekly',
      target: 10,
      progress: 0,
      is_complete: false,
      created_at: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15',
      status: 'active',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedGoal,
    });

    const result = await createGoal(goalData);

    expect(result).toEqual(mockCreatedGoal);
  });
});

describe('createGoalFromTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create goal from template', async () => {
    const templateId = 1;
    const goalData = {
      user: 1,
      start_date: '2024-01-15',
      status: 'active' as const,
    };

    const mockCreatedGoal: Goal = {
      id: 1,
      category: {
        id: 1,
        name: 'Plastic Bottles',
        category: 1,
        description: 'Plastic bottles',
        score_per_unit: '10',
        unit: 'bottle',
        is_active: true,
      },
      timeframe: 'weekly',
      target: 10,
      progress: 0,
      is_complete: false,
      created_at: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15',
      status: 'active',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedGoal,
    });

    const result = await createGoalFromTemplate(templateId, goalData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.GOALS.CREATE_FROM_TEMPLATE(templateId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      }
    );
    expect(result).toEqual(mockCreatedGoal);
  });

  it('should handle invalid template ID', async () => {
    const templateId = 999;
    const goalData = {
      user: 1,
      start_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Template not found.',
      }),
    });

    await expect(createGoalFromTemplate(templateId, goalData)).rejects.toThrow();
  });

  it('should handle validation errors', async () => {
    const templateId = 1;
    const invalidData = {
      user: 1,
      start_date: 'invalid-date', // Invalid date format
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        start_date: ['Date has wrong format. Use one of these formats instead: YYYY-MM-DD.'],
      }),
    });

    await expect(createGoalFromTemplate(templateId, invalidData)).rejects.toThrow();
  });

  it('should handle missing required fields', async () => {
    const templateId = 1;
    const incompleteData = {
      user: 1,
    } as any;

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        start_date: ['This field is required.'],
      }),
    });

    await expect(createGoalFromTemplate(templateId, incompleteData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const templateId = 1;
    const goalData = {
      user: 1,
      start_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(createGoalFromTemplate(templateId, goalData)).rejects.toThrow('Network error');
  });

  it('should handle optional status field', async () => {
    const templateId = 1;
    const goalData = {
      user: 1,
      start_date: '2024-01-15',
      // status is optional
    };

    const mockCreatedGoal: Goal = {
      id: 1,
      category: {
        id: 1,
        name: 'Plastic Bottles',
        category: 1,
        description: 'Plastic bottles',
        score_per_unit: '10',
        unit: 'bottle',
        is_active: true,
      },
      timeframe: 'weekly',
      target: 10,
      progress: 0,
      is_complete: false,
      created_at: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15',
      status: 'active',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedGoal,
    });

    const result = await createGoalFromTemplate(templateId, goalData);

    expect(result).toEqual(mockCreatedGoal);
  });
});
