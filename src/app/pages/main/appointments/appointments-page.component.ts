import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { TuiButton, TuiHint } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { AppointmentFormComponent } from 'app/pages/main/appointments/appointments-form/appointment-form.component';
import { ORDER_PAGE_SIZE } from 'app/shared/consts/pagination.const';
import { OrderCardComponent } from 'app/shared/components/order-card/order-card.component';
import { Appointment, AppointmentPage, WorkType } from 'app/shared/models/appointment.model';
import { Car } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [AppointmentFormComponent, OrderCardComponent, TuiButton, TuiHint, TuiPagination],
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
      appointments: this.appointmentService.getAll(1).pipe(
        catchError(() => {
          this.hasError.set(true);
          return of({ count: 0, next: null, previous: null, results: [] } satisfies AppointmentPage);
        })
      ),
      cars: this.carService.getAll(),
      workTypes: this.appointmentService.getWorkTypes(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ appointments, cars, workTypes }) => {
          this.setAppointmentsPage(appointments, 1);
          this.cars.set(cars);
          this.workTypes.set(workTypes);
        },
        error: () => this.hasError.set(true),
      });
  }

  private loadAppointments(page: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.appointmentService
      .getAll(page)
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
