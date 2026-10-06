import { Routes } from '@angular/router';

import { AppShellComponent } from './pages/main/app-shell.component';
import { AppointmentsPageComponent } from './pages/main/appointments/appointments-page.component';
import { CarsPageComponent } from './pages/main/cars/cars-page.component';
import { HomePageComponent } from './pages/main/home/home-page.component';
import { ProfilePageComponent } from './pages/main/profile/profile-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/auth-page.component').then((c) => c.AuthPageComponent),
  },

  {
    path: 'roles',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/select-role/select-role.component').then((c) => c.SelectRoleComponent),
  },

  {
    path: 'role-switch',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/auth/select-role/select-role.component').then((c) => c.SelectRoleComponent),
    data: {
      mode: 'switch',
    },
  },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'main',
        component: HomePageComponent,
        canActivate: [roleGuard],
        data: {
          title: 'Главная',
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
              import('./pages/main/cars/car-form/car-form.component').then((c) => c.CarFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./pages/main/cars/car-form/car-form.component').then((c) => c.CarFormComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/main/cars/car-details/car-details.component').then((c) => c.CarDetailsComponent),
          },
        ],
        data: {
          title: 'Авто',
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
        redirectTo: 'main',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'main',
  },
];
