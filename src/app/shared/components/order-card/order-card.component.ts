import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButton, TuiExpand } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';

import { Appointment } from 'app/shared/models/appointment.model';
import { RoleAccessService } from 'app/shared/services/role-access.service';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [TuiButton, TuiExpand, TuiCardLarge, RouterLink],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  private readonly roleAccess = inject(RoleAccessService);

  public readonly order = input.required<Appointment>();
  public readonly showCarInfo = input(false);
  public readonly showPayment = input(false);
  public readonly compactExpandable = input(false);

  protected readonly expanded = signal(false);

  protected readonly isAdminRole = computed(() => {
    return this.roleAccess.isActiveRole(UserRole.Admin);
  });

  protected readonly isMechanicRole = computed(() => {
    return this.roleAccess.isActiveRole(UserRole.Mechanic);
  });

  readonly workTypes = computed(
    () =>
      this.order()
        .works.map((work) => work.name)
        .join(', ') || '-'
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

  protected toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }
}
