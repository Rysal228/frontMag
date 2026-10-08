const version = 'v1';

export const API_ENDPOINTS = {
  auth: {
    login: `/api/${version}/users/auth/login/`,
    register: `/api/${version}/users/auth/register/`,
    max: `/api/${version}/users/auth/max/`,
    maxCodeRequest: `/api/${version}/users/auth/max/code/request/`,
    maxCodeVerify: `/api/${version}/users/auth/max/code/verify/`,
    switchRole: `/api/${version}/users/auth/switch-role/`,
    selectRole: `/api/${version}/users/auth/select-role/`,
    refresh: `/api/${version}/users/auth/token/refresh/`,
    password: `/api/${version}/users/auth/password/`,
  },
  users: {
    profile: `/api/${version}/users/profile/`,
    list: `/api/${version}/users/`,
  },
  cars: {
    list: `/api/${version}/cars/`,
    navigation: (id: string) => `/api/${version}/cars/${id}/navigation/`,
    orders: (id: string) => `/api/${version}/cars/${id}/orders/`,
    brands: `/api/${version}/cars/brands/`,
    models: `/api/${version}/cars/models/`,
  },
  news: { list: `/api/${version}/news/` },
  orders: {
    list: `/api/${version}/orders/`,
    statuses: `/api/${version}/orders/order-status/`,
    workStatuses: `/api/${version}/orders/work-status/`,
    workTypes: `/api/${version}/orders/work-type/`,
    availability: `/api/${version}/orders/availability/`,
    filterPermissions: `/api/${version}/orders/filter-permissions/`,
    permissions: (id: string) => `/api/${version}/orders/${id}/permissions/`,
    transitionStatus: (id: string) => `/api/${version}/orders/${id}/transition-status/`,
    transitionWorkStatus: (id: string) => `/api/${version}/orders/${id}/transition-work-status/`,
    paymentStatus: (id: string) => `/api/${version}/orders/${id}/payment-status/`,
    paymentStatuses: `/api/${version}/orders/payment-status/`,
  },
} as const;
