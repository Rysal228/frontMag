import { Injectable } from '@angular/core';

import { isUserRole, RoleStorage, UserRole } from '../types/roles.types';

const STORAGE_KEY = 'app_selected_role';

@Injectable()
export class LocalStorageRoleStorage implements RoleStorage {
  public read(): UserRole | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isUserRole(raw) ? raw : null;
  }

  public write(role: UserRole): void {
    localStorage.setItem(STORAGE_KEY, role);
  }

  public clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
