const version = 'v1';

export const API_ENDPOINTS = {
  auth: {
    login: `/api/${version}/users/auth/login/`,
    register: `/api/${version}/users/auth/register/`,
    max: `/api/${version}/users/auth/max/`,
    refresh: `/api/${version}/users/auth/token/refresh/`,
  },
} as const;
