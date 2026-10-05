import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiButton } from '@taiga-ui/core';

import { Appointment } from 'app/shared/models/appointment.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  public readonly order = input.required<Appointment>();
  public readonly showCarInfo = input(false);
  public readonly showPayment = input(false);

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
