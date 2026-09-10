import { inject, Injectable, signal } from '@angular/core';

import { AuthTokens } from '../types/auth.types';

import { TOKEN_STORAGE } from './token-storage';

@Injectable({
  providedIn: 'root',
})
export class TokenStore {
  private readonly storage = inject(TOKEN_STORAGE);

  private readonly _tokens = signal<AuthTokens | null>(this.storage.read());

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
    this.storage.write(tokens);
  }

  public clear(): void {
    this._tokens.set(null);
    this.storage.clear();
  }
}
