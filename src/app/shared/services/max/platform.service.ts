import { Injectable, inject } from '@angular/core';

import { MaxBridgeService } from './max-bridge.service';

export type AppEnvironment = 'max' | 'browser';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly maxBridge = inject(MaxBridgeService);

  public get isMax(): boolean {
    return this.maxBridge.isAvailable;
  }

  public get isBrowser(): boolean {
    return !this.isMax;
  }

  public get platform() {
    return this.maxBridge.platform;
  }
}
