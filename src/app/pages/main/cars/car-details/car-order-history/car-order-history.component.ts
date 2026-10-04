import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { Appointment } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-car-order-history',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './car-order-history.component.html',
  styleUrl: './car-order-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarOrderHistoryComponent {
  private readonly appointmentService = inject(AppointmentService);

  protected readonly orders = signal<Appointment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  private readonly carId = input.required<string>();

  constructor() {
    effect(() => {
      this.loadOrders(this.carId());
    });
  }

  protected reload(): void {
    this.loadOrders(this.carId());
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  private loadOrders(carId: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appointmentService
      .getByCarId(carId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: () => {
          this.orders.set([]);
          this.hasError.set(true);
        },
      });
  }
}
