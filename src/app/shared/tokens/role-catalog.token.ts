import { InjectionToken } from '@angular/core';

import { DEFAULT_ROLE_CATALOG } from '../consts/role-catalog.const';
import { RoleDefinition } from '../types/roles.types';

export const ROLE_CATALOG = new InjectionToken<readonly RoleDefinition[]>('ROLE_CATALOG', {
  providedIn: 'root',
  factory: () => DEFAULT_ROLE_CATALOG,
});
