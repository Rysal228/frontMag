import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, finalize, shareReplay, tap, throwError } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { MaxAuthRequest, RefreshTokenRequest } from 'app/shared/models/auth.model';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { TokenStore } from 'app/shared/storage/token-store';
import { AuthTokens } from 'app/shared/types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);

  private refreshRequest$: Observable<AuthTokens> | null = null;

  public authenticateWithMax(initData: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(API_ENDPOINTS.auth.max, { initData } satisfies MaxAuthRequest).pipe(
      tap((tokens) => {
        this.tokenStore.set(tokens);
      })
    );
  }

  public refresh(): Observable<AuthTokens> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.tokenStore.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token is not available'));
    }

    this.refreshRequest$ = this.http
      .post<AuthTokens>(API_ENDPOINTS.auth.refresh, { refreshToken } satisfies RefreshTokenRequest)
      .pipe(
        tap((tokens) => {
          this.tokenStore.set(tokens);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  public logout(): void {
    this.tokenStore.clear();
    this.currentUser.clear();
    this.currentRole.clear();
  }
}
