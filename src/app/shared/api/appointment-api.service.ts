import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import {
  Appointment,
  AppointmentAvailability,
  CreateAppointmentRequest,
  WorkType,
} from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(API_ENDPOINTS.orders.list);
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
