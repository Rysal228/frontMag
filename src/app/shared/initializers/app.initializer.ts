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

  console.log('[MAX AUTH] initData:', initData);

  if (initData) {
    const authDate = new URLSearchParams(initData).get('auth_date');

    console.log('[MAX AUTH] auth_date:', authDate);
    console.log('[MAX AUTH] age:', authDate ? Math.floor(Date.now() / 1000) - Number(authDate) : 'unknown');
  }

  try {
    const contact = await maxBridge.requestContact();

    localStorage.setItem(
      'max-auth-debug',
      JSON.stringify({
        browserNow: Math.floor(Date.now() / 1000),
        browserNowIso: new Date().toISOString(),

        initAuthDate: new URLSearchParams(initData).get('auth_date'),

        phoneAuthDate: contact.authDate,
        phoneAuthDateNumber: Number(contact.authDate),

        initAge: Math.floor(Date.now() / 1000) - Number(new URLSearchParams(initData).get('auth_date')),

        phoneAge: Math.floor(Date.now() / 1000) - Number(contact.authDate),
      })
    );

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
