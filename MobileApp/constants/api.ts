// Base URL for the API
export const API_BASE_URL = 'http://192.168.51.255:8000';

// API Endpoints organized by feature
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    GOOGLE_LOGIN: '/api/auth/google/',
    REFRESH: '/api/token/refresh/',
    VERIFY: '/api/token/verify/',
    PASSWORD_CHANGE: '/api/auth/password/change/',
    PASSWORD_RESET: '/api/auth/password/reset/',
    PASSWORD_RESET_CONFIRM: (uid: string, token: string) => 
      `/api/auth/password/reset/confirm/${uid}/${token}/`,
    TEST_PROTECTED: '/api/auth/test-protected/',
  },

  // User profile endpoints
  USER: {
    PROFILE: '/api/user/me/',
    USERS: '/api/user/users/',
    USER_BY_ID: (id: number) => `/api/user/users/${id}/`,
    SET_ACTIVE_STATUS: (id: number) => `/api/user/users/${id}/set_active_status/`,
  },

  // Waste management endpoints
  WASTE: {
    // Categories
    CATEGORIES: '/api/v1/waste/categories/',
    CATEGORY_BY_ID: (id: number) => `/api/v1/waste/categories/${id}/`,
    CATEGORY_REQUEST: '/api/v1/waste/categories/request/',
    
    // Subcategories
    SUBCATEGORIES: '/api/v1/waste/subcategories/',
    SUBCATEGORY_BY_ID: (id: number) => `/api/v1/waste/subcategories/${id}/`,
    
    // Logs
    LOGS: '/api/v1/waste/logs/',
    LOG_BY_ID: (id: number) => `/api/v1/waste/logs/${id}/`,
    
    // Scores
    MY_SCORE: '/api/v1/waste/scores/me/',
    
    // Suggestions and Actions
    SUGGESTIONS: '/api/v1/waste/suggestions/',
    SUSTAINABLE_ACTIONS: '/api/v1/waste/sustainable-actions/',
    
    // Admin endpoints
    ADMIN: {
      CATEGORY_REQUESTS: '/api/v1/waste/admin/categories/requests/',
      APPROVE_CATEGORY_REQUEST: (id: number) => 
        `/api/v1/waste/admin/categories/requests/${id}/approve/`,
      REJECT_CATEGORY_REQUEST: (id: number) => 
        `/api/v1/waste/admin/categories/requests/${id}/reject/`,
    },
  },

  // Goals management endpoints
  GOALS: {
    LIST: '/api/v1/goals/goals/',
    BY_ID: (id: string) => `/api/v1/goals/goals/${id}/`,
    CREATE_FROM_TEMPLATE: (templateId: number) => 
      `/api/v1/goals/goals/api-template/${templateId}/`,
    TEMPLATES: '/api/v1/goals/templates/',
  },
};

// Helper function to create authentication headers
export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Common API Types
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  city?: string;
  country?: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  date_joined: string;
  notifications_enabled: boolean;
}

export interface WasteCategory {
  id: number;
  name: 'Recyclable' | 'Organic' | 'Electronic' | 'Glass' | 'Cooking Oil' | 'Clothing' | 'Other';
  description?: string;
  is_active: boolean;
}

export interface WasteLog {
  id: number;
  sub_category: number;
  sub_category_name: string;
  quantity?: string;
  date_logged: string;
  disposal_date?: string;
  disposal_location?: string;
  disposal_photo?: string;
  score: number;
}

export interface Goal {
  id: number;
  category: WasteCategory;
  goal_type: 'reduction' | 'recycling';
  timeframe: 'daily' | 'weekly' | 'monthly';
  target: number;
  progress: number;
  is_complete: boolean;
  created_at: string;
  start_date?: string;
  end_date?: string;
  status: string;
}

export interface UserScore {
  user_id: number;
  total_score: number;
} 