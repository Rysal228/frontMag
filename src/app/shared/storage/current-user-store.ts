import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { CurrentUser } from '../models/user.model';
import { UserService } from '../services/user.service';
import { isUserRole } from '../types/roles.types';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserStore {
  private readonly userService = inject(UserService);

  private readonly _user = signal<CurrentUser | null>(null);
  private readonly _isLoading = signal(false);

  public readonly user = this._user.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  public load(): Observable<CurrentUser | null> {
    this._isLoading.set(true);

    return this.userService.getProfile().pipe(
      tap((user) => this._user.set(isUserRole(user.role) ? user : null)),
      catchError(() => of(null)),
      tap(() => this._isLoading.set(false))
    );
  }

  public clear(): void {
    this._user.set(null);
  }
}
