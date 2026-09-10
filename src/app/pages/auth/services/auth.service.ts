import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, finalize, firstValueFrom, shareReplay, tap, throwError } from 'rxjs';

import { LoginRequest, MaxAuthRequest, RefreshTokenRequest, RegisterRequest } from 'app/shared/models/auth.model';
import { TokenStore } from 'app/shared/storage/auth-token-store';
import { AuthTokens } from 'app/shared/types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);

  private refreshRequest$: Observable<AuthTokens> | null = null;

  public async login(request: LoginRequest): Promise<void> {
    const tokens = await firstValueFrom(this.http.post<AuthTokens>('/api/auth/login/', request));

    this.tokenStore.set(tokens);
  }

  public async register(request: RegisterRequest): Promise<void> {
    const tokens = await firstValueFrom(this.http.post<AuthTokens>('/api/auth/register/', request));

    this.tokenStore.set(tokens);
  }

  public async authenticateWithMax(initData: string): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>('/api/auth/max', {
        initData,
      } satisfies MaxAuthRequest)
    );

    this.tokenStore.set(tokens);
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
      .post<AuthTokens>('/api/auth/token/refresh/', {
        refreshToken,
      } satisfies RefreshTokenRequest)
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
  }
}
