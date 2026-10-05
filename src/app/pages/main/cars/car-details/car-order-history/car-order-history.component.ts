import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { OrderCardComponent } from 'app/shared/components/order-card/order-card.component';
import { ORDER_PAGE_SIZE } from 'app/shared/consts/pagination.const';
import { Appointment } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-car-order-history',
  standalone: true,
  imports: [OrderCardComponent, TuiButton, TuiPagination],
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
          this.totalPages.set(Math.ceil(response.count / ORDER_PAGE_SIZE));
        },
        error: () => {
          this.orders.set([]);
          this.hasError.set(true);
        },
      });
  }
}
