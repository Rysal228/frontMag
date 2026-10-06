import { inject, Injectable } from '@angular/core';

import { CurrentUserStore } from '../storage/current-user-store';
import { UserRole } from '../types/roles.types';

@Injectable({ providedIn: 'root' })
export class RoleAccessService {
  private readonly currentUser = inject(CurrentUserStore);

  public hasAccess(requiredRole: UserRole): boolean {
    return this.currentUser.user()?.roles.includes(requiredRole) ?? false;
  }
}
