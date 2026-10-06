import { Injectable, signal } from '@angular/core';

import { isUserRole, UserRole } from '../types/roles.types';

@Injectable({ providedIn: 'root' })
export class CurrentRoleStore {
  private readonly _role = signal<UserRole | null>(null);

  public readonly role = this._role.asReadonly();

  public set(role: UserRole): void {
    this._role.set(role);
  }

  public clear(): void {
    this._role.set(null);
  }

  public sync(role: unknown): void {
    this._role.set(isUserRole(role) ? role : null);
  }
}
