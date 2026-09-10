export type LoginRequest = {
  phone: string;
  password: string;
};

export type RegisterRequest = {
  phone: string;
  password: string;
  fullName: string;
  birthday: string | null;
};

export type MaxAuthRequest = {
  initData: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};
