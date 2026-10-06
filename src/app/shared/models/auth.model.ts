import { AuthTokens } from '../types/auth.types';
import { UserRole } from '../types/roles.types';

export type LoginRequest = {
  phone: string;
  password: string;
  role?: UserRole;
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
  role?: UserRole;
};

export type MaxContactAuthRequest = MaxAuthRequest & {
  phone: string;
  phoneAuthDate: string;
  phoneHash: string;
};

export type RoleSelectionRequired = {
  status: 'role_selection_required';
  roles: UserRole[];
  selectionToken: string;
};

export type AuthResult = AuthTokens | RoleSelectionRequired;

export type MaxAuthResult = { status: 'contact_required' } | AuthResult;

export type RoleSelectionRequest = {
  selectionToken: string;
  role: UserRole;
};

export type MaxCodeRequest = { phone: string };

export type MaxCodeVerifyRequest = {
  phone: string;
  code: string;
  role?: UserRole;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type SwitchRoleRequest = {
  role: UserRole;
};
