import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppInitializationService } from '../services/max/app-initialization.service';

export const authGuard: CanActivateFn = () => {
  const initialization = inject(AppInitializationService);
  const router = inject(Router);

  return initialization.state() === 'authenticated' ? true : router.parseUrl('/auth');
};
