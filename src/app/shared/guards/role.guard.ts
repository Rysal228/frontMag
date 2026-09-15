import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { RoleAccessService } from '../services/role-access.service';
import { CurrentRoleStore } from '../storage/current-role-store';
import { CurrentUserStore } from '../storage/current-user-store';
import { UserRole } from '../types/roles.types';

export const roleGuard: CanActivateFn = (route) => {
  const currentRole = inject(CurrentRoleStore);
  const currentUser = inject(CurrentUserStore);
  const roleAccess = inject(RoleAccessService);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'] as UserRole | undefined;

  if (!requiredRole) {
    return true;
  }

  const checkAccess = (): boolean =>
    currentRole.role() === requiredRole && roleAccess.hasAccess(requiredRole);

  if (currentUser.user()) {
    return checkAccess() ? true : router.parseUrl('/roles');
  }

  return currentUser.load().pipe(
    map(() => (checkAccess() ? true : router.parseUrl('/roles'))),
  );
};
