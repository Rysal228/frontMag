import { Injectable, signal } from '@angular/core';

export type AppInitializationState = 'initializing' | 'authentication-required' | 'authenticated' | 'error';

@Injectable({
  providedIn: 'root',
})
export class AppInitializationService {
  private readonly _state = signal<AppInitializationState>('initializing');

  public readonly state = this._state.asReadonly();

  public setState(state: AppInitializationState): void {
    this._state.set(state);
  }
}
