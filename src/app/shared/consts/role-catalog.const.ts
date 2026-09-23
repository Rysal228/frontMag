import { RoleDefinition, UserRole } from '../types/roles.types';

export const DEFAULT_ROLE_CATALOG: readonly RoleDefinition[] = [
  {
    role: UserRole.Mechanic,
    label: 'Механик',
    icon: '@tui.wrench',
    appearance: 'outline',
    homeRoute: '/main',
  },
  {
    role: UserRole.User,
    label: 'Пользователь',
    icon: '@tui.user',
    appearance: 'secondary',
    homeRoute: '/main',
  },
  {
    role: UserRole.Admin,
    label: 'Администратор',
    icon: '@tui.user-cog',
    appearance: 'outline',
    homeRoute: '/main',
  },
];
