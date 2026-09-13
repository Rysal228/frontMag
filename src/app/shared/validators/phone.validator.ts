import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');

    if (!value) {
      return null;
    }

    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11 || !digits.startsWith('7')) {
      return {
        phone: true,
      };
    }

    return null;
  };
}
