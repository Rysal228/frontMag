import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import {
  Appointment,
  AppointmentPage,
  AppointmentAvailability,
  CreateAppointmentRequest,
  WorkType,
} from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  public getAll(page = 1): Observable<AppointmentPage> {
    const params = new HttpParams().set('page', page);

    return this.http.get<AppointmentPage>(API_ENDPOINTS.orders.list, { params });
  }

  public getByCarId(carId: string, page = 1): Observable<AppointmentPage> {
    const params = new HttpParams().set('page', page);

    return this.http.get<AppointmentPage>(API_ENDPOINTS.cars.orders(carId), { params });
  }

  public getWorkTypes(): Observable<WorkType[]> {
    return this.http.get<WorkType[]>(API_ENDPOINTS.orders.workTypes);
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.list, request);
  }

  public getAvailability(date: string): Observable<AppointmentAvailability> {
    const params = new HttpParams().set('date', date);

    return this.http.get<AppointmentAvailability>(API_ENDPOINTS.orders.availability, { params });
  }
}
