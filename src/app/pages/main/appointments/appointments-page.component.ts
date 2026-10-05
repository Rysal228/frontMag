import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { TuiButton, TuiHint } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { AppointmentFormComponent } from 'app/pages/main/appointments/appointments-form/appointment-form.component';
import { OrderCardComponent } from 'app/shared/components/order-card/order-card.component';
import { OrderFiltersComponent } from 'app/shared/components/order-filters/order-filters.component';
import { ORDER_PAGE_SIZE } from 'app/shared/consts/pagination.const';
import {
  Appointment,
  AppointmentPage,
  OrderFilterPermissions,
  OrderFilters,
  OrderStatus,
  WorkStatus,
  WorkType,
} from 'app/shared/models/appointment.model';
import { Car, CarBrand, CarModel } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [AppointmentFormComponent, OrderCardComponent, OrderFiltersComponent, TuiButton, TuiHint, TuiPagination],
  templateUrl: './appointments-page.component.html',
  styleUrl: './appointments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsPageComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly carService = inject(CarService);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly cars = signal<Car[]>([]);
  protected readonly workTypes = signal<WorkType[]>([]);
  protected readonly brands = signal<CarBrand[]>([]);
  protected readonly models = signal<CarModel[]>([]);
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
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isCreateOpen = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(0);

  constructor() {
    this.loadData();
  }

  protected openCreate(): void {
    this.isCreateOpen.set(true);
  }

  protected closeCreate(): void {
    this.isCreateOpen.set(false);
  }

  protected onCreated(): void {
    this.isCreateOpen.set(false);
    this.loadAppointments(1);
  }

  protected onFiltersChange(filters: OrderFilters): void {
    this.filters.set(filters);
    this.loadAppointments(1);
  }

  protected reload(): void {
    this.loadData();
  }

  protected onPageChange(pageIndex: number): void {
    this.loadAppointments(pageIndex + 1);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      appointments: this.appointmentService.getAll(1, this.filters()).pipe(
        catchError(() => {
          this.hasError.set(true);
          return of({ count: 0, next: null, previous: null, results: [] } satisfies AppointmentPage);
        })
      ),
      cars: this.carService.getAll(),
      workTypes: this.appointmentService.getWorkTypes(),
      filterPermissions: this.appointmentService.getFilterPermissions(),
      statuses: this.appointmentService.getStatuses(),
      workStatuses: this.appointmentService.getWorkStatuses(),
      brands: this.carService.getBrands(),
      models: this.carService.getModels(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ appointments, cars, workTypes, filterPermissions, statuses, workStatuses, brands, models }) => {
          this.setAppointmentsPage(appointments, 1);
          this.cars.set(cars);
          this.workTypes.set(workTypes);
          this.filterPermissions.set(filterPermissions);
          this.statuses.set(statuses);
          this.workStatuses.set(workStatuses);
          this.brands.set(brands);
          this.models.set(models);
        },
        error: () => this.hasError.set(true),
      });
  }

  private loadAppointments(page: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appointmentService
      .getAll(page, this.filters())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.setAppointmentsPage(response, page),
        error: () => {
          this.appointments.set([]);
          this.hasError.set(true);
        },
      });
  }

  private setAppointmentsPage(response: AppointmentPage, page: number): void {
    this.appointments.set(response.results);
    this.currentPage.set(page);
    this.totalPages.set(Math.ceil(response.count / ORDER_PAGE_SIZE));
  }
}
