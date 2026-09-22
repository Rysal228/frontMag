import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

import { LocalStorageService } from 'app/shared/services/local-storage.service';

export type AppTheme = 'light' | 'dark';
export type ThemePreference = AppTheme | 'system';

const THEME_STORAGE_KEY = 'app-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');

  private readonly _preference = signal<AppTheme | null>(this.readTheme());
  public readonly preference = this._preference.asReadonly();

  private readonly _systemTheme = signal<AppTheme>(this.media.matches ? 'dark' : 'light');

  public readonly effectiveTheme = computed<AppTheme>(() => this._preference() ?? this._systemTheme());

  constructor() {
    const listener = (event: MediaQueryListEvent): void => {
      this._systemTheme.set(event.matches ? 'dark' : 'light');
    };

    this.media.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => this.media.removeEventListener('change', listener));
  }

  public setTheme(theme: AppTheme): void {
    this._preference.set(theme);
    this.storage.set(THEME_STORAGE_KEY, theme);
  }

  private readTheme(): AppTheme | null {
    const stored = this.storage.get(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  }
}
