import { AuthTokens } from '../types/auth.types';

export type LoginRequest = {
  phone: string;
  password: string;
};

export type RegisterRequest = {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  birthday: string | null;
};

export type MaxAuthRequest = {
  initData: string;
  forceContact?: boolean;
};

export type MaxContactAuthRequest = MaxAuthRequest & {
  phone: string;
  phoneAuthDate: string;
  phoneHash: string;
};

export type MaxAuthResult =
  | { status: 'contact_required' }
  | AuthTokens;

export type MaxCodeRequest = {
  phone: string;
};

export type MaxCodeVerifyRequest = {
  phone: string;
  code: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};
