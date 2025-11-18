import {
  getSubcategories,
  getWasteLogs,
  getWasteLogById,
  createWasteLog,
  updateWasteLog,
  deleteWasteLog,
  createCategoryRequest,
  Subcategory,
  WasteLog,
  CreateWasteLogData,
  UpdateWasteLogData,
  CreateCategoryRequestData,
} from '../functions';
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
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('getSubcategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch subcategories with pagination', async () => {
    const mockSubcategories: Subcategory[] = [
      {
        id: 1,
        name: 'Plastic Bottles',
        category: 1,
        description: 'Plastic bottles',
        score_per_unit: '10',
        unit: 'bottle',
        is_active: true,
      },
      {
        id: 2,
        name: 'Glass Bottles',
        category: 1,
        description: 'Glass bottles',
        score_per_unit: '15',
        unit: 'bottle',
        is_active: true,
      },
    ];

    // Mock paginated response (fetchAllPages handles pagination internally)
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: mockSubcategories,
        next: null,
      }),
    });

    const result = await getSubcategories();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.WASTE.SUBCATEGORIES);
    expect(result).toEqual(mockSubcategories);
  });

  it('should handle errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getSubcategories()).rejects.toThrow();
  });

  it('should handle empty results', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [],
        next: null,
      }),
    });

    const result = await getSubcategories();

    expect(result).toEqual([]);
  });
});

describe('getWasteLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch waste logs', async () => {
    const mockLogs: WasteLog[] = [
      {
        id: 1,
        sub_category_name: 'Plastic Bottles',
        quantity: '5',
        unit: 'bottle',
        date_logged: '2024-01-15T10:00:00Z',
        disposal_date: '2024-01-15',
        disposal_location: 'Recycling Center',
        score: 50,
        sub_category: 1,
      },
    ];

    // Mock paginated response
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: mockLogs,
        next: null,
      }),
    });

    const result = await getWasteLogs();

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.WASTE.LOGS);
    expect(result).toEqual(mockLogs);
  });

  it('should handle errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(getWasteLogs()).rejects.toThrow();
  });
});

describe('getWasteLogById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch waste log by ID', async () => {
    const mockLog: WasteLog = {
      id: 1,
      sub_category_name: 'Plastic Bottles',
      quantity: '5',
      unit: 'bottle',
      date_logged: '2024-01-15T10:00:00Z',
      disposal_date: '2024-01-15',
      disposal_location: 'Recycling Center',
      score: 50,
      sub_category: 1,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockLog,
    });

    const result = await getWasteLogById(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.WASTE.LOG_BY_ID(1)
    );
    expect(result).toEqual(mockLog);
  });

  it('should handle invalid ID', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Not found.',
      }),
    });

    await expect(getWasteLogById(999)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getWasteLogById(1)).rejects.toThrow('Network error');
  });
});

describe('createWasteLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create waste log', async () => {
    const logData: CreateWasteLogData = {
      sub_category: 1,
      quantity: 5,
      disposal_date: '2024-01-15',
      disposal_location: 'Recycling Center',
    };

    const mockCreatedLog: WasteLog = {
      id: 1,
      sub_category_name: 'Plastic Bottles',
      quantity: '5',
      unit: 'bottle',
      date_logged: '2024-01-15T10:00:00Z',
      disposal_date: '2024-01-15',
      disposal_location: 'Recycling Center',
      score: 50,
      sub_category: 1,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedLog,
    });

    const result = await createWasteLog(logData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(API_ENDPOINTS.WASTE.LOGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    expect(result).toEqual(mockCreatedLog);
  });

  it('should handle validation errors', async () => {
    const invalidData: CreateWasteLogData = {
      sub_category: 1,
      quantity: -5, // Invalid negative quantity
      disposal_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        quantity: ['Quantity must be greater than 0.'],
      }),
    });

    await expect(createWasteLog(invalidData)).rejects.toThrow();
  });

  it('should handle missing required fields', async () => {
    const incompleteData = {
      sub_category: 1,
    } as CreateWasteLogData;

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        quantity: ['This field is required.'],
        disposal_date: ['This field is required.'],
      }),
    });

    await expect(createWasteLog(incompleteData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const logData: CreateWasteLogData = {
      sub_category: 1,
      quantity: 5,
      disposal_date: '2024-01-15',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(createWasteLog(logData)).rejects.toThrow('Network error');
  });
});

describe('updateWasteLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update waste log', async () => {
    const updateData: UpdateWasteLogData = {
      quantity: 10,
      disposal_location: 'Updated Location',
    };

    const mockUpdatedLog: WasteLog = {
      id: 1,
      sub_category_name: 'Plastic Bottles',
      quantity: '10',
      unit: 'bottle',
      date_logged: '2024-01-15T10:00:00Z',
      disposal_date: '2024-01-15',
      disposal_location: 'Updated Location',
      score: 100,
      sub_category: 1,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedLog,
    });

    const result = await updateWasteLog(1, updateData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.WASTE.LOG_BY_ID(1),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }
    );
    expect(result).toEqual(mockUpdatedLog);
  });

  it('should handle invalid ID', async () => {
    const updateData: UpdateWasteLogData = {
      quantity: 10,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Not found.',
      }),
    });

    await expect(updateWasteLog(999, updateData)).rejects.toThrow();
  });

  it('should handle validation errors', async () => {
    const invalidData: UpdateWasteLogData = {
      quantity: -5,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        quantity: ['Quantity must be greater than 0.'],
      }),
    });

    await expect(updateWasteLog(1, invalidData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const updateData: UpdateWasteLogData = {
      quantity: 10,
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(updateWasteLog(1, updateData)).rejects.toThrow('Network error');
  });
});

describe('deleteWasteLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete waste log', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await deleteWasteLog(1);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.WASTE.LOG_BY_ID(1),
      {
        method: 'DELETE',
      }
    );
    expect(result).toBeUndefined();
  });

  it('should handle invalid ID', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        detail: 'Not found.',
      }),
    });

    await expect(deleteWasteLog(999)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(deleteWasteLog(1)).rejects.toThrow('Network error');
  });

  it('should handle permission errors', async () => {
    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        detail: 'You do not have permission to perform this action.',
      }),
    });

    await expect(deleteWasteLog(1)).rejects.toThrow();
  });
});

describe('createCategoryRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create category request', async () => {
    const requestData: CreateCategoryRequestData = {
      name: 'New Category',
      description: 'Description of new category',
      unit: 'kg',
    };

    const mockCreatedRequest = {
      id: 1,
      ...requestData,
      status: 'pending',
      created_at: '2024-01-15T10:00:00Z',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedRequest,
    });

    const result = await createCategoryRequest(requestData);

    expect(tokenManager.authenticatedFetch).toHaveBeenCalledWith(
      API_ENDPOINTS.WASTE.CATEGORY_REQUEST,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      }
    );
    expect(result).toEqual(mockCreatedRequest);
  });

  it('should handle validation errors', async () => {
    const invalidData: CreateCategoryRequestData = {
      name: '', // Empty name
      unit: 'kg',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        name: ['This field may not be blank.'],
      }),
    });

    await expect(createCategoryRequest(invalidData)).rejects.toThrow();
  });

  it('should handle missing required fields', async () => {
    const incompleteData = {
      name: 'Test',
    } as CreateCategoryRequestData;

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        unit: ['This field is required.'],
      }),
    });

    await expect(createCategoryRequest(incompleteData)).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    const requestData: CreateCategoryRequestData = {
      name: 'Test Category',
      unit: 'kg',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(createCategoryRequest(requestData)).rejects.toThrow('Network error');
  });

  it('should handle optional description field', async () => {
    const requestData: CreateCategoryRequestData = {
      name: 'Test Category',
      unit: 'kg',
      // description is optional
    };

    const mockCreatedRequest = {
      id: 1,
      name: 'Test Category',
      unit: 'kg',
      description: null,
      status: 'pending',
    };

    (tokenManager.authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreatedRequest,
    });

    const result = await createCategoryRequest(requestData);

    expect(result).toEqual(mockCreatedRequest);
  });
});
