import { Injectable } from '@angular/core';

import { AuthTokens, TokenStorage } from '../types/auth.types';

const STORAGE_KEY = 'app_auth_tokens';

@Injectable()
export class LocalStorageToken implements TokenStorage {
  public read(): AuthTokens | null {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const tokens = JSON.parse(raw) as AuthTokens;

      if (!tokens.accessToken || !tokens.refreshToken) {
        return null;
      }

      return tokens;
    } catch {
      return null;
    }
  }

  public write(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  public clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
