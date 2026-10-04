import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export const vinValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = String(control.value ?? '').trim().toUpperCase();

  if (!value) {
    return null;
  }

  if (value.length !== 17) {
    return {
      vinLength: {
        requiredLength: 17,
        actualLength: value.length,
      },
    };
  }

  if (!VIN_PATTERN.test(value)) {
    return { vinCharacters: true };
  }

  return null;
};
