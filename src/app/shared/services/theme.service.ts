import { inject, Injectable, signal } from '@angular/core';

import { LocalStorageService } from 'app/shared/services/local-storage.service';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(LocalStorageService);

  private readonly _theme = signal<AppTheme>(this.readTheme());

  public readonly theme = this._theme.asReadonly();

  public setTheme(theme: AppTheme): void {
    this._theme.set(theme);
    this.storage.set(THEME_STORAGE_KEY, theme);
  }

  public toggle(): void {
    this.setTheme(this._theme() === 'light' ? 'dark' : 'light');
  }

  private readTheme(): AppTheme {
    return this.storage.get(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }
}
