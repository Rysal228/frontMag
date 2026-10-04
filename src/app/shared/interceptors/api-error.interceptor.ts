import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { TuiAlertService } from '@taiga-ui/core';

import { SilentApiError } from '../errors/silent-api-error';
import { ApiError } from '../models/api-error.model';

import { SKIP_API_ERROR_ALERT } from './api-error-context';

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
    message: error.status === 0 ? 'Не удалось связаться с сервером.' : 'Произошла ошибка при выполнении запроса.',
    details: null,
  };
}

function getDetailsMessages(details: ApiError['details']): string[] {
  if (!details) {
    return [];
  }

  const messages: string[] = [];

  const collect = (value: unknown): void => {
    if (typeof value === 'string') {
      messages.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (value && typeof value === 'object') {
      Object.values(value).forEach(collect);
    }
  };

  collect(details);

  return messages;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerts = inject(TuiAlertService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof SilentApiError) {
        return throwError(() => error);
      }

      if (req.context.get(SKIP_API_ERROR_ALERT)) {
        return throwError(() => error);
      }

      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const apiError = getApiError(error);

      const detailsMessages = getDetailsMessages(apiError.details);
      const message = detailsMessages.length > 0 ? detailsMessages.join('\n') : apiError.message;

      alerts
        .open(message, {
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
