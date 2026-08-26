import { Injectable } from '@angular/core';

export type AppInitializationState =
  'initializing' | 'browser' | 'max-authenticated' | 'max-authentication-required' | 'error';

@Injectable({
  providedIn: 'root',
})
export class AppInitializationService {
  private _state: AppInitializationState = 'initializing';

  public get state(): AppInitializationState {
    return this._state;
  }

  public setState(state: AppInitializationState): void {
    this._state = state;
  }
}
