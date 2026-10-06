import { Injectable, signal } from '@angular/core';

import { isUserRole, UserRole } from '../types/roles.types';

export type RoleSelectionState = {
  selectionToken: string;
  roles: UserRole[];
};

@Injectable({ providedIn: 'root' })
export class RoleSelectionStore {
  private readonly _state = signal<RoleSelectionState | null>(null);

  public readonly state = this._state.asReadonly();

  public set(selectionToken: string, roles: unknown): void {
    if (!selectionToken || !Array.isArray(roles)) {
      this.clear();
      return;
    }

    const validRoles = roles.filter(isUserRole);

    if (!validRoles.length) {
      this.clear();
      return;
    }

    this._state.set({
      selectionToken,
      roles: validRoles,
    });
  }

  public clear(): void {
    this._state.set(null);
  }
}
