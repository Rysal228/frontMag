// import { inject, Injectable, signal } from '@angular/core';

// import { ROLE_STORAGE_KEY } from '../consts/token.const';
// import { isUserRole, UserRole } from '../types/roles.types';

// import { LocalStorageService } from './local-storage.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class CurrentRoleStore {
//   private readonly storage = inject(LocalStorageService);

//   private readonly _role = signal<UserRole | null>(this.readRole());

//   public readonly role = this._role.asReadonly();

//   public set(role: UserRole): void {
//     this._role.set(role);
//     this.storage.set(ROLE_STORAGE_KEY, role);
//   }

//   public clear(): void {
//     this._role.set(null);
//     this.storage.remove(ROLE_STORAGE_KEY);
//   }

//   private readRole(): UserRole | null {
//     const role = this.storage.get(ROLE_STORAGE_KEY);

//     return isUserRole(role) ? role : null;
//   }
// }
