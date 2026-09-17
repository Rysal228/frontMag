import { Routes } from '@angular/router';

import { AppShellComponent } from './pages/main/app-shell.component';
import { AppointmentsPageComponent } from './pages/main/appointments/appointments-page.component';
import { CarsPageComponent } from './pages/main/cars/cars-page.component';
import { SectionPlaceholderComponent } from './pages/main/section-placeholder.component';
import { ProfilePageComponent } from './pages/main/profile/profile-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';
import { UserRole } from './shared/types/roles.types';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth-page.component').then((c) => c.AuthPageComponent),
  },

  {
    path: 'roles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/auth/select-role/select-role.component').then((c) => c.SelectRoleComponent),
  },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'user',
        component: SectionPlaceholderComponent,
        canActivate: [roleGuard],
        data: {
          requiredRole: UserRole.User,
          title: 'Главная',
        },
      },
      {
        path: 'mechanic',
        component: SectionPlaceholderComponent,
        canActivate: [roleGuard],
        data: {
          requiredRole: UserRole.Mechanic,
          title: 'Главная механика',
        },
      },
      {
        path: 'admin',
        component: SectionPlaceholderComponent,
        canActivate: [roleGuard],
        data: {
          requiredRole: UserRole.Admin,
          title: 'Главная администратора',
        },
      },
      {
        path: 'cars',
        children: [
          {
            path: '',
            component: CarsPageComponent,
            pathMatch: 'full',
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/main/cars/car-form.component').then((c) => c.CarFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/main/cars/car-form.component').then((c) => c.CarFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/main/cars/car-details.component').then((c) => c.CarDetailsComponent),
          },
        ],
        data: {
          title: 'Мои авто',
        },
      },
      {
        path: 'appointments',
        component: AppointmentsPageComponent,
        data: {
          title: 'Записи',
        },
      },
      {
        path: 'profile',
        component: ProfilePageComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'roles',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'roles',
  },
];
