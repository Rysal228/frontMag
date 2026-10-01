import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'app/pages/auth/services/auth.service';

import { AppInitializationService } from '../services/max/app-initialization.service';
import { MaxBridgeLoaderService } from '../services/max/max-bridge-loader.service';
import { MaxBridgeService } from '../services/max/max-bridge.service';
import { PlatformService } from '../services/max/platform.service';
import { CurrentRoleStore } from '../storage/current-role-store';
import { TokenStore } from '../storage/token-store';

function hasInitDataHash(initData: string): boolean {
  return new URLSearchParams(initData).has('hash');
}

export async function initializeApplication(): Promise<void> {
  const bridgeLoader = inject(MaxBridgeLoaderService);
  const maxBridgeService = inject(MaxBridgeService);
  const platform = inject(PlatformService);
  const authService = inject(AuthService);
  const tokenStore = inject(TokenStore);
  const currentRole = inject(CurrentRoleStore);
  const router = inject(Router);
  const initialization = inject(AppInitializationService);

  initialization.setState('initializing');

  const bridgeLoaded = await bridgeLoader.load();

  if (!bridgeLoaded || !platform.isMax) {
    initialization.setState(tokenStore.isAuthenticated ? 'authenticated' : 'authentication-required');

    return;
  }

  const initData = maxBridgeService.initData;

  if (!initData) {
    console.warn('[MAX AUTH] initData is unavailable.');

    authService.logout();
    initialization.setState('authentication-required');

    await router.navigateByUrl('/auth');

    return;
  }

  if (!hasInitDataHash(initData)) {
    console.warn('[MAX AUTH] initData does not contain a hash.');

    authService.logout();
    initialization.setState('authentication-required');

    await router.navigateByUrl('/auth');

    return;
  }

  try {
    const contact = await maxBridgeService.requestContact();

    await firstValueFrom(
      authService.authenticateWithMax({
        initData,
        phone: contact.phone,
        phoneAuthDate: contact.authDate,
        phoneHash: contact.hash,
      })
    );

    currentRole.clear();
    initialization.setState('authenticated');

    await router.navigateByUrl('/roles');
  } catch (error) {
    console.error('[MAX AUTH] Authentication failed', error);

    authService.logout();
    initialization.setState('authentication-required');

    await router.navigateByUrl('/auth');
  }
}
