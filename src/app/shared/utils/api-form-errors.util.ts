import { HttpErrorResponse } from '@angular/common/http';
import type { AbstractControl, FormGroup } from '@angular/forms';

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function getMessage(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return String(value);
}

export function applyApiFormErrors(error: HttpErrorResponse, form: FormGroup): string | null {
  const body = error.error;

  if (!body || typeof body !== 'object') {
    return null;
  }

  let formError: string | null = null;

  for (const [key, value] of Object.entries(body)) {
    const message = getMessage(value);

    if (key === 'detail' || key === 'non_field_errors') {
      formError = message;
      continue;
    }

    const controlName = toCamelCase(key);
    const control: AbstractControl | null = form.get(controlName);

    if (!control) {
      continue;
    }

    control.setErrors({
      ...control.errors,
      server: message,
    });
  }

  return formError;
}
