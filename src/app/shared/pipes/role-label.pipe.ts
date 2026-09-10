import { inject, Pipe, PipeTransform } from '@angular/core';

import { ROLE_CATALOG } from '../tokens/role-catalog';
import { UserRole } from '../types/roles.types';

@Pipe({
  name: 'roleLabel',
  standalone: true,
  pure: true,
})
export class RoleLabelPipe implements PipeTransform {
  private readonly catalog = inject(ROLE_CATALOG);

  transform(role: UserRole | null | undefined): string {
    if (!role) {
      return '—';
    }

    return this.catalog.find((item) => item.role === role)?.label ?? '—';
  }
}
