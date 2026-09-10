import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ROLE_CATALOG } from 'app/shared/tokens/role-catalog';
import { UserRole } from 'app/shared/types/roles.types';

@Injectable({ providedIn: 'root' })
export class RoleNavigationService {
  private readonly router = inject(Router);
  private readonly catalog = inject(ROLE_CATALOG);

  goToRoleHome(role: UserRole): Promise<boolean> {
    const definition = this.catalog.find((item) => item.role === role);

    if (!definition) {
      throw new Error(`Не найдено определение маршрута для роли "${role}"`);
    }

    return this.router.navigateByUrl(definition.homeRoute);
  }
}
