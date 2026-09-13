import type { MaskitoOptions } from '@maskito/core';

export const PHONE_MASKITO_OPTIONS: MaskitoOptions = {
  mask: ['+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
};
