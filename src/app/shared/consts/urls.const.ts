export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login/',
    register: '/api/auth/register/',
    max: '/api/auth/max/',
    refresh: '/api/auth/token/refresh/',
  },
} as const;
