import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppointmentApiService } from 'app/shared/api/appointment-api.service';
import {
  Appointment,
  AppointmentAvailability,
  CreateAppointmentRequest,
  WorkType,
} from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly appointmentApiService = inject(AppointmentApiService);

  public getAll(): Observable<Appointment[]> {
    return this.appointmentApiService.getAll();
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
