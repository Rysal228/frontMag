import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppointmentApiService } from 'app/shared/api/appointment-api.service';
import {
  Appointment,
  AppointmentPage,
  AppointmentAvailability,
  CreateAppointmentRequest,
  WorkType,
  OrderFilterPermissions,
  OrderFilters,
} from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly appointmentApiService = inject(AppointmentApiService);

  public getAll(page = 1, filters?: OrderFilters): Observable<AppointmentPage> {
    return this.appointmentApiService.getAll(page, filters);
  }

  public getFilterPermissions(): Observable<OrderFilterPermissions> {
    return this.appointmentApiService.getFilterPermissions();
  }

  public getByCarId(carId: string, page = 1, filters?: OrderFilters): Observable<AppointmentPage> {
    return this.appointmentApiService.getByCarId(carId, page, filters);
  }

  public getWorkTypes(): Observable<WorkType[]> {
    return this.appointmentApiService.getWorkTypes();
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.appointmentApiService.create(request);
  }

  public getAvailability(date: string): Observable<AppointmentAvailability> {
    return this.appointmentApiService.getAvailability(date);
  }
}
