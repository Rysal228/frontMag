import { inject, Injectable } from '@angular/core';

import { CurrentUserStore } from '../storage/current-user-store';
import { UserRole } from '../types/roles.types';

const ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.User]: 1,
  [UserRole.Mechanic]: 2,
  [UserRole.Admin]: 3,
};

@Injectable({
  providedIn: 'root',
})
export class RoleAccessService {
  private readonly currentUser = inject(CurrentUserStore);

  public hasAccess(requiredRole: UserRole): boolean {
    const userRole = this.currentUser.user()?.role;

    return userRole ? ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole] : false;
  }
}
