import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStore } from '../storage/auth-token-store';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  return tokenStore.isAuthenticated ? true : router.parseUrl('/auth');
};
