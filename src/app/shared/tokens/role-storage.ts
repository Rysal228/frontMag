import { InjectionToken } from '@angular/core';

import { RoleStorage } from '../types/roles.types';

export const ROLE_STORAGE = new InjectionToken<RoleStorage>('ROLE_STORAGE');
