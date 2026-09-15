import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from 'app/pages/auth/services/auth.service';

import { API_ENDPOINTS } from '../consts/urls.const';
import { TokenStore } from '../storage/token-store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url === API_ENDPOINTS.auth.refresh) {
    return next(req);
  }

  const accessToken = tokenStore.accessToken;

  const authRequest = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!tokenStore.refreshToken) {
        authService.logout();

        void router.navigate(['/auth']);

        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap(() => {
          const newAccessToken = tokenStore.accessToken;

          if (!newAccessToken) {
            authService.logout();

            void router.navigate(['/auth']);

            return throwError(() => new Error('Access token is not available after refresh'));
          }

          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            })
          );
        }),
        catchError((refreshError) => {
          authService.logout();

          void router.navigate(['/auth']);

          return throwError(() => refreshError);
        })
      );
    })
  );
};
