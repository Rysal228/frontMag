import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButton, TuiExpandComponent } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';

import { OrderCardDetailsComponent } from 'app/shared/components/order-card/order-card-details.component';
import { Appointment } from 'app/shared/models/appointment.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [TuiButton, TuiExpandComponent, TuiCardLarge, RouterLink, OrderCardDetailsComponent],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  public readonly order = input.required<Appointment>();
  public readonly showCarInfo = input(false);
  public readonly showPayment = input(false);
  public readonly compactExpandable = input(false);

  protected readonly expanded = signal(false);

  protected toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }
}
