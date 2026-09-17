import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AppointmentApiResponse, AppointmentApiService } from 'app/shared/api/appointment-api.service';
import { Appointment, CreateAppointmentRequest, WorkType } from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly appointmentApiService = inject(AppointmentApiService);

  public getAll(): Observable<Appointment[]> {
    return this.appointmentApiService.getAll().pipe(map((appointments) => appointments.map((item) => this.map(item))));
  }

  public getWorkTypes(): Observable<WorkType[]> {
    return this.appointmentApiService.getWorkTypes();
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.appointmentApiService.create(request).pipe(map((appointment) => this.map(appointment)));
  }

  private map(appointment: AppointmentApiResponse): Appointment {
    return {
      id: appointment.id,
      orderNumber: appointment.orderNumber,
      car: appointment.car,
      carName: appointment.carName,
      workType: appointment.work_type,
      workTypeName: appointment.workTypeName,
      statusName: appointment.statusName,
      appointmentAt: appointment.appointmentAt,
      description: appointment.description,
      price: Number(appointment.price),
      createdAt: appointment.createdAt,
    };
  }
}
