import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { Appointment } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-car-order-history',
  standalone: true,
  imports: [TuiButton, TuiPagination],
  templateUrl: './car-order-history.component.html',
  styleUrl: './car-order-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarOrderHistoryComponent {
  private readonly appointmentService = inject(AppointmentService);

  protected readonly orders = signal<Appointment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(0);

  public readonly carId = input.required<string>();

  constructor() {
    effect(() => {
      this.loadOrders(this.carId());
    });
  }

  protected reload(): void {
    this.loadOrders(this.carId(), this.currentPage());
  }

  protected onPageChange(pageIndex: number): void {
    this.loadOrders(this.carId(), pageIndex + 1);
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

  private loadOrders(carId: string, page = 1): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appointmentService
      .getByCarId(carId, page)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.orders.set(response.results);
          this.currentPage.set(page);
          this.totalPages.set(Math.ceil(response.count / 5));
        },
        error: () => {
          this.orders.set([]);
          this.hasError.set(true);
        },
      });
  }
}
