import { Injectable } from '@angular/core';

import { MaxPlatform } from 'app/shared/models/max-bridge.model';

@Injectable({
  providedIn: 'root',
})
export class MaxBridgeService {
  public get isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.WebApp);
  }

  public get platform(): MaxPlatform {
    return window.WebApp?.platform ?? 'web';
  }

  public get initData(): string | null {
    return window.WebApp?.initData ?? null;
  }

  public get initDataUnsafe() {
    return window.WebApp?.initDataUnsafe ?? null;
  }

  public showBackButton(onClick: () => void): void {
    const backButton = window.WebApp?.BackButton;

    if (!backButton) {
      return;
    }

    backButton.onClick(onClick);
    backButton.show();
  }

  public hideBackButton(): void {
    window.WebApp?.BackButton.hide();
  }

  public hapticSelection(): void {
    window.WebApp?.HapticFeedback.selectionChanged();
  }

  public hapticImpact(style: 'soft' | 'light' | 'medium' | 'heavy' | 'rigid' = 'light'): void {
    window.WebApp?.HapticFeedback.impactOccurred(style);
  }

  public async setDeviceStorageItem(key: string, value: string): Promise<void> {
    if (!window.WebApp) {
      return;
    }

    await window.WebApp.DeviceStorage.setItem(key, value);
  }

  public async getDeviceStorageItem(key: string): Promise<string | null> {
    if (!window.WebApp) {
      return null;
    }

    return window.WebApp.DeviceStorage.getItem(key);
  }
}
