import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

const MAX_BRIDGE_URL = 'https://st.max.ru/js/max-web-app.js';

const MAX_BRIDGE_TIMEOUT = 5000;

@Injectable({
  providedIn: 'root',
})
export class MaxBridgeLoaderService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  public async load(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (this.isBridgeAvailable()) {
      return true;
    }

    return this.loadScript();
  }

  private isBridgeAvailable(): boolean {
    return Boolean(window.WebApp);
  }

  private loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = this.document.createElement('script');

      script.src = MAX_BRIDGE_URL;
      script.async = true;

      const timeout = window.setTimeout(() => {
        resolve(this.isBridgeAvailable());
      }, MAX_BRIDGE_TIMEOUT);

      script.onload = () => {
        window.clearTimeout(timeout);
        resolve(this.isBridgeAvailable());
      };

      script.onerror = () => {
        window.clearTimeout(timeout);
        resolve(false);
      };

      this.document.head.appendChild(script);
    });
  }
}
