import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentRoleStore } from '../storage/current-role-store.storage';
import { UserRole } from '../types/roles.types';

/**
 * Guard для защиты роутов конкретной роли.
 *
 * Использование в routes:
 * ```ts
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { requiredRole: UserRole.Admin },
 *   loadComponent: () => import('./pages/admin/admin.component')...
 * }
 * ```
 *
 * Если роль ещё не выбрана — отправляем на экран выбора.
 * Если выбрана другая роль — тоже отправляем на экран выбора
 * (а не молча пускаем на чужой раздел).
 */
export const roleGuard: CanActivateFn = (route) => {
  const currentRole = inject(CurrentRoleStore);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as UserRole | undefined;
  const role = currentRole.role();

  const isAllowed = role !== null && (!requiredRole || role === requiredRole);

  return isAllowed ? true : router.parseUrl('/');
};
