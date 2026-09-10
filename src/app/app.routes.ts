import { Routes } from '@angular/router';

import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth-form/auth-form.component').then((c) => c.AuthFormComponent),
  },

  {
    path: 'roles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/auth/select-role/select-role.component').then((c) => c.SelectRoleComponent),
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'roles',
  },

  {
    path: '**',
    redirectTo: 'roles',
  },
];
