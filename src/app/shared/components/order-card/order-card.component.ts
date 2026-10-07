import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { Appointment } from 'app/shared/models/appointment.model';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  private readonly roleAccess = inject(RoleAccessService);

  public readonly order = input.required<Appointment>();
  public readonly showCarInfo = input(false);
  public readonly showPayment = input(false);

  protected readonly showOwnerPhone = computed(
    () =>
      this.roleAccess.isActiveRole(UserRole.Mechanic) ||
      this.roleAccess.isActiveRole(UserRole.Admin),
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
