import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'app/pages/auth/services/auth.service';

import { AppInitializationService } from '../services/max/app-initialization.service';
import { MaxBridgeLoaderService } from '../services/max/max-bridge-loader.service';
import { MaxBridgeService } from '../services/max/max-bridge.service';
import { PlatformService } from '../services/max/platform.service';
import { TokenStore } from '../storage/token-store';

export async function initializeApplication(): Promise<void> {
  const bridgeLoader = inject(MaxBridgeLoaderService);
  const maxBridge = inject(MaxBridgeService);
  const platform = inject(PlatformService);
  const authService = inject(AuthService);
  const tokenStore = inject(TokenStore);
  const initialization = inject(AppInitializationService);

  initialization.setState('initializing');

  const bridgeLoaded = await bridgeLoader.load();

  if (!bridgeLoaded || !platform.isMax) {
    initialization.setState(tokenStore.isAuthenticated ? 'authenticated' : 'authentication-required');

    return;
  }

  const initData = maxBridge.initData;

  if (!initData) {
    initialization.setState(tokenStore.isAuthenticated ? 'authenticated' : 'authentication-required');

    return;
  }

  try {
    const contact = await maxBridge.requestContact();

    await firstValueFrom(
      authService.authenticateWithMax({
        initData,
        phone: contact.phone,
        phoneAuthDate: contact.authDate,
        phoneHash: contact.hash,
      })
    );

    initialization.setState('authenticated');
  } catch (error) {
    console.error('[MAX AUTH] Authentication failed', error);
    initialization.setState(tokenStore.isAuthenticated ? 'authenticated' : 'authentication-required');
  }
}
