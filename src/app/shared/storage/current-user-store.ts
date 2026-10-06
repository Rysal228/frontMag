import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { CurrentUser, UpdateProfileRequest } from '../models/user.model';
import { UserService } from '../services/user.service';
import { CurrentRoleStore } from './current-role-store';
import { isUserRole } from '../types/roles.types';

@Injectable({ providedIn: 'root' })
export class CurrentUserStore {
  private readonly userService = inject(UserService);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly _user = signal<CurrentUser | null>(null);
  private readonly _isLoading = signal(false);

  public readonly user = this._user.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  public load(): Observable<CurrentUser | null> {
    this._isLoading.set(true);
    return this.userService.getProfile().pipe(
      tap((user) => {
        const valid =
          Array.isArray(user.roles) &&
          user.roles.every(isUserRole) &&
          (user.activeRole === null || isUserRole(user.activeRole));
        this._user.set(valid ? user : null);
        this.currentRole.sync(valid ? user.activeRole : null);
      }),
      catchError(() => of(null)),
      tap(() => this._isLoading.set(false)),
    );
  }

  public update(profile: UpdateProfileRequest): Observable<CurrentUser> {
    return this.userService.updateProfile(profile).pipe(
      tap((user) => {
        this._user.set(user);
        this.currentRole.sync(user.activeRole);
      }),
    );
  }

  public clear(): void {
    this._user.set(null);
    this.currentRole.clear();
  }
}
