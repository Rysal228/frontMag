import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import {
  AuthResult,
  LoginRequest,
  MaxCodeRequest,
  MaxCodeVerifyRequest,
  RoleSelectionRequest,
  SwitchRoleRequest,
} from 'app/shared/models/auth.model';
import { TokenStore } from 'app/shared/storage/token-store';
import { AuthTokens } from 'app/shared/types/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthFormService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);

  public login(request: LoginRequest): Observable<AuthResult> {
    return this.http.post<AuthResult>(API_ENDPOINTS.auth.login, request).pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }

  public requestMaxCode(request: MaxCodeRequest): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.auth.maxCodeRequest, request);
  }

  public verifyMaxCode(request: MaxCodeVerifyRequest): Observable<AuthResult> {
    return this.http.post<AuthResult>(API_ENDPOINTS.auth.maxCodeVerify, request).pipe(
      tap((result) => {
        if ('accessToken' in result) {
          this.tokenStore.set(result);
        }
      }),
    );
  }

  public selectRole(request: RoleSelectionRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(API_ENDPOINTS.auth.selectRole, request)
      .pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }

  public switchRole(request: SwitchRoleRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(API_ENDPOINTS.auth.switchRole, request)
      .pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }
}
