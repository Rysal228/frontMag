import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { forkJoin } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { OrderFiltersComponent } from 'app/shared/components/order-filters/order-filters.component';
import { OrderCardComponent } from 'app/shared/components/order-card/order-card.component';
import { ORDER_PAGE_SIZE } from 'app/shared/consts/pagination.const';
import { Appointment, OrderFilterPermissions, OrderFilters, OrderStatus, WorkStatus, WorkType } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-car-order-history',
  standalone: true,
  imports: [OrderCardComponent, OrderFiltersComponent, TuiButton, TuiPagination],
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
  protected readonly workTypes = signal<WorkType[]>([]);
  protected readonly statuses = signal<OrderStatus[]>([]);
  protected readonly workStatuses = signal<WorkStatus[]>([]);
  protected readonly filterPermissions = signal<OrderFilterPermissions>({
    search: false,
    order_number: false,
    vin: false,
    plate_number: false,
    brand: false,
    model: false,
    work_type: false,
    status: false,
    work_status: false,
    date_range: false,
  });
  protected readonly filters = signal<OrderFilters>({
    search: '',
    orderNumber: '',
    vin: '',
    plateNumber: '',
    brandId: null,
    modelId: null,
    workTypeId: null,
    statusId: null,
    workStatusId: null,
    dateFrom: null,
    dateTo: null,
  });

  public readonly carId = input.required<string>();

  constructor() {
    effect(() => {
      this.loadOrders(this.carId());
    });
  }

  protected onFiltersChange(filters: OrderFilters): void {
    this.filters.set(filters);
    this.loadOrders(this.carId(), 1);
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

    forkJoin({
      orders: this.appointmentService.getByCarId(carId, page, this.filters()),
      workTypes: this.appointmentService.getWorkTypes(),
      statuses: this.appointmentService.getStatuses(),
      workStatuses: this.appointmentService.getWorkStatuses(),
      filterPermissions: this.appointmentService.getFilterPermissions(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ orders, workTypes, statuses, workStatuses, filterPermissions }) => {
          this.orders.set(orders.results);
          this.currentPage.set(page);
          this.totalPages.set(Math.ceil(orders.count / ORDER_PAGE_SIZE));
          this.workTypes.set(workTypes);
          this.statuses.set(statuses);
          this.workStatuses.set(workStatuses);
          this.filterPermissions.set(filterPermissions);
        },
        error: () => {
          this.orders.set([]);
          this.hasError.set(true);
        },
      });
  }
}
