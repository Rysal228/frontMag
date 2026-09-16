import { UserRole } from '../types/roles.types';

export type CurrentUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  birthday: string | null;
  role: UserRole;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  patronymic: string;
  birthday: string | null;
};
