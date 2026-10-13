import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Appointment } from 'app/shared/models/appointment.model';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-order-card-details',
  standalone: true,
  templateUrl: './order-card-details.component.html',
  styleUrl: './order-card-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardDetailsComponent {
  private readonly roleAccess = inject(RoleAccessService);

  public readonly order = input.required<Appointment>();
  public readonly showCarInfo = input(false);

  protected readonly isAdminRole = computed(() =>
    this.roleAccess.isActiveRole(UserRole.Admin)
  );

  protected readonly isMechanicRole = computed(() =>
    this.roleAccess.isActiveRole(UserRole.Mechanic)
  );

  protected readonly workTypes = computed(
    () => this.order().works.map((work) => work.name).join(', ') || '-'
  );

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
