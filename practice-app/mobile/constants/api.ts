export const API_BASE_URL = 'http://192.168.111.11:8000';

export const API_ENDPOINTS = {
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

  USER: {
    PROFILE: '/api/user/me/',
    USERS: '/api/user/users/',
    USER_BY_ID: (id: number) => `/api/user/users/${id}/`,
    SET_ACTIVE_STATUS: (id: number) => `/api/user/users/${id}/set_active_status/`,
  },

  WASTE: {
    CATEGORIES: '/api/v1/waste/categories/',
    CATEGORY_BY_ID: (id: number) => `/api/v1/waste/categories/${id}/`,
    CATEGORY_REQUEST: '/api/v1/waste/categories/request/',
    SUBCATEGORIES: '/api/v1/waste/subcategories/',
    SUBCATEGORY_BY_ID: (id: number) => `/api/v1/waste/subcategories/${id}/`,
    LOGS: '/api/v1/waste/logs/',
    LOG_BY_ID: (id: number) => `/api/v1/waste/logs/${id}/`,
    MY_SCORE: '/api/v1/waste/scores/me/',
    SUGGESTIONS: '/api/v1/waste/suggestions/',
    SUSTAINABLE_ACTIONS: '/api/v1/waste/sustainable-actions/',
    ADMIN: {
      CATEGORY_REQUESTS: '/api/v1/waste/admin/categories/requests/',
      APPROVE_CATEGORY_REQUEST: (id: number) => 
        `/api/v1/waste/admin/categories/requests/${id}/approve/`,
      REJECT_CATEGORY_REQUEST: (id: number) => 
        `/api/v1/waste/admin/categories/requests/${id}/reject/`,
    },
  },

  GOALS: {
    LIST: '/api/v1/goals/goals/',
    BY_ID: (id: string) => `/api/v1/goals/goals/${id}/`,
    CREATE: '/api/v1/goals/goals/',
    CREATE_FROM_TEMPLATE: (templateId: number) => 
      `/api/v1/goals/goals/api-template/${templateId}/`,
    TEMPLATES: '/api/v1/goals/templates/',
  },

  CHALLENGES: {
    LIST: '/v1/challenges/api/v1/challenges/',
    DETAIL: (id: number) => `/v1/challenges/api/v1/challenges/${id}/`,
    JOIN: (id: number) => `/v1/challenges/api/v1/challenges/${id}/join/`,
    LEAVE: (id: number) => `/v1/challenges/api/v1/challenges/${id}/leave/`,
  },
};