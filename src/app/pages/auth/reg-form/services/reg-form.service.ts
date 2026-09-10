import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { RegisterRequest } from 'app/shared/models/auth.model';
import { TokenStore } from 'app/shared/storage/auth-token-store';
import { AuthTokens } from 'app/shared/types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class RegFormService {
  private readonly http = inject(HttpClient);
  private readonly tokenStore = inject(TokenStore);

  public register(request: RegisterRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/login/', request).pipe(tap((tokens) => this.tokenStore.set(tokens)));
  }
}
