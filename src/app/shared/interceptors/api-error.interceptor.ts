import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { TuiAlertService } from '@taiga-ui/core';

import { API_ENDPOINTS } from '../consts/urls.const';
import { ApiError } from '../models/api-error.model';

function getApiError(error: HttpErrorResponse): ApiError {
  if (error.error && typeof error.error === 'object') {
    const body = error.error as Partial<ApiError>;

    if (typeof body.message === 'string') {
      return {
        code: typeof body.code === 'string' ? body.code : 'api_error',
        message: body.message,
        details: body.details ?? null,
      };
    }
  }

  return {
    code: 'network_error',
    message:
      error.status === 0
        ? 'Не удалось связаться с сервером.'
        : 'Произошла ошибка при выполнении запроса.',
    details: null,
  };
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerts = inject(TuiAlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url === API_ENDPOINTS.auth.refresh) {
        return throwError(() => error);
      }

      const apiError = getApiError(error);

      alerts
        .open(apiError.message, {
          label: 'Ошибка',
          appearance: 'negative',
        })
        .subscribe();

      console.error('[API ERROR]', {
        url: req.url,
        status: error.status,
        code: apiError.code,
        details: apiError.details,
      });

      return throwError(() => error);
    })
  );
};
