const version = 'v1';

export const API_ENDPOINTS = {
  auth: {
    login: `/api/${version}/users/auth/login/`,
    register: `/api/${version}/users/auth/register/`,
    max: `/api/${version}/users/auth/max/`,
    refresh: `/api/${version}/users/auth/token/refresh/`,
  },
  users: {
    profile: `/api/${version}/users/profile/`,
  },
  cars: {
    list: `/api/${version}/cars/`,
    brands: `/api/${version}/cars/brands/`,
    models: `/api/${version}/cars/models/`,
  },
  orders: {
    statuses: `/api/${version}/orders/order-status/`,
  },
} as const;
