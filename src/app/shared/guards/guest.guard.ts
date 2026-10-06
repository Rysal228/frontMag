import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStore } from '../storage/token-store';

export const guestGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  return tokenStore.isAuthenticated ? router.parseUrl('/main') : true;
};
