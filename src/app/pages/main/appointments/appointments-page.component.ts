import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { TuiButton, TuiHint } from '@taiga-ui/core';

import { AppointmentFormComponent } from 'app/pages/main/appointments/appointments-form/appointment-form.component';
import { Appointment, WorkType } from 'app/shared/models/appointment.model';
import { Car } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [AppointmentFormComponent, TuiButton, TuiHint],
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
    this.loadAppointments();
  }

  protected reload(): void {
    this.loadData();
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      new Date(value)
    );
  }

  protected formatAppointmentDate(value: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      appointments: this.appointmentService.getAll().pipe(
        catchError(() => {
          this.hasError.set(true);
          return of([]);
        })
      ),
      cars: this.carService.getAll(),
      workTypes: this.appointmentService.getWorkTypes(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ appointments, cars, workTypes }) => {
          this.appointments.set(appointments);
          this.cars.set(cars);
          this.workTypes.set(workTypes);
        },
        error: () => this.hasError.set(true),
      });
  }

  private loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: (appointments) => this.appointments.set(appointments),
      error: () => this.hasError.set(true),
    });
  }
}
