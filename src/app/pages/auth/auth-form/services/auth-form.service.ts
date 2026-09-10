import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { LoginRequest } from 'app/shared/models/auth.model';
import { TokenStore } from 'app/shared/storage/auth-token-store';
import { AuthTokens } from 'app/shared/types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthFormService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);

  public login(request: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/login/', request).pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }
}
