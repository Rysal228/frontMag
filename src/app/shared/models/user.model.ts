import { UserRole } from '../types/roles.types';

export type CurrentUser = {
  id: string;
  username: string | null;
  phone: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  birthday: string | null;
  role: UserRole;
};
