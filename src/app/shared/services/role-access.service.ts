import { inject, Injectable } from '@angular/core';

import { CurrentRoleStore } from '../storage/current-role-store';
import { CurrentUserStore } from '../storage/current-user-store';
import { UserRole } from '../types/roles.types';

@Injectable({ providedIn: 'root' })
export class RoleAccessService {
  private readonly currentUser = inject(CurrentUserStore);
  private readonly currentRole = inject(CurrentRoleStore);

  public hasRole(role: UserRole): boolean {
    return this.currentUser.user()?.roles.includes(role) ?? false;
  }

  public isActiveRole(role: UserRole): boolean {
    return this.currentRole.role() === role;
  }

  public hasAccess(requiredRole: UserRole): boolean {
    return this.hasRole(requiredRole);
  }
}
