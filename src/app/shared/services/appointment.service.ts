import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppointmentApiService } from 'app/shared/api/appointment-api.service';
import {
  Appointment,
  AppointmentPage,
  AppointmentAvailability,
  CreateAppointmentRequest,
  WorkType,
  OrderStatus,
  WorkStatus,
  OrderFilterPermissions,
  OrderFilters,
  OrderPermissions,
  PaymentStatus,
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

  public getWorkTypes(search = ''): Observable<WorkType[]> {
    return this.appointmentApiService.getWorkTypes(search);
  }

  public getStatuses(): Observable<OrderStatus[]> {
    return this.appointmentApiService.getStatuses();
  }

  public getWorkStatuses(): Observable<WorkStatus[]> {
    return this.appointmentApiService.getWorkStatuses();
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.appointmentApiService.create(request);
  }

  public getById(id: string): Observable<Appointment> {
    return this.appointmentApiService.getById(id);
  }

  public getPermissions(id: string): Observable<OrderPermissions> {
    return this.appointmentApiService.getPermissions(id);
  }

  public transitionStatus(id: string, statusId: number): Observable<Appointment> {
    return this.appointmentApiService.transitionStatus(id, statusId);
  }

  public transitionWorkStatus(id: string, statusId: number): Observable<Appointment> {
    return this.appointmentApiService.transitionWorkStatus(id, statusId);
  }

  public getPaymentStatuses(): Observable<PaymentStatus[]> {
    return this.appointmentApiService.getPaymentStatuses();
  }

  public setPaymentStatus(id: string, statusId: number): Observable<Appointment> {
    return this.appointmentApiService.setPaymentStatus(id, statusId);
  }

  public getAvailability(date: string): Observable<AppointmentAvailability> {
    return this.appointmentApiService.getAvailability(date);
  }
}