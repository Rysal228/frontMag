import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CurrentRoleStore } from '../storage/current-role-store';
import { UserRole } from '../types/roles.types';

export const roleGuard: CanActivateFn = (route) => {
  const currentRole = inject(CurrentRoleStore);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as UserRole | undefined;
  const role = currentRole.role();

  const isAllowed = role !== null && (!requiredRole || role === requiredRole);

  return isAllowed ? true : router.parseUrl('/roles');
};
