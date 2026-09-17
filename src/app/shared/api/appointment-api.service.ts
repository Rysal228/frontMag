import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { Appointment, CreateAppointmentRequest, WorkType } from 'app/shared/models/appointment.model';

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
}
