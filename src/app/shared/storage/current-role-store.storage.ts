import { inject, Injectable, signal } from '@angular/core';

import { ROLE_STORAGE } from '../tokens/role-storage';
import { UserRole } from '../types/roles.types';

@Injectable({ providedIn: 'root' })
export class CurrentRoleStore {
  private readonly storage = inject(ROLE_STORAGE);

  private readonly _role = signal<UserRole | null>(this.storage.read());
  readonly role = this._role.asReadonly();

  public set(role: UserRole): void {
    this._role.set(role);
    this.storage.write(role);
  }

  public clear(): void {
    this._role.set(null);
    this.storage.clear();
  }
}
