import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from 'app/pages/auth/services/auth.service';

import { API_ENDPOINTS } from '../consts/urls.const';
import { SilentApiError } from '../errors/silent-api-error';
import { TokenStore } from '../storage/token-store';

const AUTH_ENDPOINTS = new Set<string>([
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.max,
  API_ENDPOINTS.auth.maxCodeRequest,
  API_ENDPOINTS.auth.maxCodeVerify,
  API_ENDPOINTS.auth.refresh,
]);

function isMaxSessionInvalid(error: HttpErrorResponse): boolean {
  return error.status === 401 && error.error?.code === 'max_session_invalid';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (AUTH_ENDPOINTS.has(req.url)) {
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

      if (!accessToken) {
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

            return throwError(() => new SilentApiError(new Error('Access token is not available after refresh')));
          }

          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            })
          );
        }),
        catchError((refreshError: HttpErrorResponse) => {
          if (isMaxSessionInvalid(refreshError)) {
            return authService.reauthenticateWithMax(true).pipe(
              switchMap(() => {
                const newAccessToken = tokenStore.accessToken;

                if (!newAccessToken) {
                  authService.logout();
                  void router.navigate(['/auth']);

                  return throwError(
                    () => new SilentApiError(new Error('Access token is not available after MAX re-authentication'))
                  );
                }

                return next(
                  req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newAccessToken}`,
                    },
                  })
                );
              }),
              catchError((reauthError) => {
                authService.logout();
                void router.navigate(['/auth']);

                return throwError(() => new SilentApiError(reauthError));
              })
            );
          }

          authService.logout();
          void router.navigate(['/auth']);

          return throwError(() => new SilentApiError(refreshError));
        })
      );
    })
  );
};
