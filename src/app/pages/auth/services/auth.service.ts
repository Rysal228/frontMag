import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, finalize, from, of, shareReplay, switchMap, tap, throwError } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { MaxAuthRequest, MaxContactAuthRequest, MaxAuthResult } from 'app/shared/models/auth.model';
import { MaxBridgeService } from 'app/shared/services/max/max-bridge.service';
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
  private readonly maxBridgeService = inject(MaxBridgeService);
  private readonly currentUser = inject(CurrentUserStore);

  private refreshRequest$: Observable<AuthTokens> | null = null;
  private maxReauthRequest$: Observable<AuthTokens> | null = null;

  public authenticateWithMax(request: MaxAuthRequest): Observable<MaxAuthResult> {
    return this.http.post<MaxAuthResult>(API_ENDPOINTS.auth.max, request).pipe(
      tap((result) => {
        if ('accessToken' in result) {
          this.tokenStore.set(result);
        }
      })
    );
  }

  public authenticateWithMaxContact(request: MaxContactAuthRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(API_ENDPOINTS.auth.max, request)
      .pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }

  public reauthenticateWithMax(forceContact = false): Observable<AuthTokens> {
    if (this.maxReauthRequest$) {
      return this.maxReauthRequest$;
    }

    const initData = this.maxBridgeService.initData;

    if (!initData) {
      return throwError(() => new Error('MAX initData is not available'));
    }

    this.maxReauthRequest$ = this.authenticateWithMax({
      initData,
      forceContact,
    }).pipe(
      switchMap((result) => {
        if ('accessToken' in result) {
          return of(result);
        }

        return from(this.maxBridgeService.requestContact()).pipe(
          switchMap((contact) =>
            this.authenticateWithMaxContact({
              initData,
              phone: contact.phone,
              phoneAuthDate: contact.authDate,
              phoneHash: contact.hash,
            })
          )
        );
      }),
      finalize(() => {
        this.maxReauthRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.maxReauthRequest$;
  }

  public refresh(): Observable<AuthTokens> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshToken = this.tokenStore.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token is not available'));
    }

    this.refreshRequest$ = this.http.post<AuthTokens>(API_ENDPOINTS.auth.refresh, { refresh: refreshToken }).pipe(
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
