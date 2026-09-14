import { inject, Injectable, signal } from '@angular/core';

import { LocalStorageService } from '../services/local-storage.service';
import { AuthTokens } from '../types/auth.types';

const TOKEN_STORAGE_KEY = 'app_auth_tokens';

@Injectable({
  providedIn: 'root',
})
export class TokenStore {
  private readonly storage = inject(LocalStorageService);

  private readonly _tokens = signal<AuthTokens | null>(this.readTokens());

  public readonly tokens = this._tokens.asReadonly();

  public get accessToken(): string | null {
    return this._tokens()?.accessToken ?? null;
  }

  public get refreshToken(): string | null {
    return this._tokens()?.refreshToken ?? null;
  }

  public get isAuthenticated(): boolean {
    return this._tokens() !== null;
  }

  public set(tokens: AuthTokens): void {
    this._tokens.set(tokens);
    this.storage.set(TOKEN_STORAGE_KEY, tokens);
  }

  public clear(): void {
    this._tokens.set(null);
    this.storage.remove(TOKEN_STORAGE_KEY);
  }

  private readTokens(): AuthTokens | null {
    const tokens = this.storage.get<AuthTokens>(TOKEN_STORAGE_KEY);

    if (!tokens?.accessToken || !tokens.refreshToken) {
      return null;
    }

    return tokens;
  }
}
