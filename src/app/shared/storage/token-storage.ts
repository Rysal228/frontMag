import { InjectionToken } from '@angular/core';

import { TokenStorage } from '../types/auth.types';

export const TOKEN_STORAGE = new InjectionToken<TokenStorage>('TOKEN_STORAGE');
