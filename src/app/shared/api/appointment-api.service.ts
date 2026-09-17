import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { CreateAppointmentRequest, WorkType } from 'app/shared/models/appointment.model';

export type AppointmentApiResponse = {
  id: string;
  orderNumber: string;
  car: string;
  carName: string;
  carPlateNumber: string | null;
  work_type: number;
  workTypeName: string;
  statusName: string;
  appointmentAt: string;
  description: string;
  price: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<AppointmentApiResponse[]> {
    return this.http.get<AppointmentApiResponse[]>(API_ENDPOINTS.orders.list);
  }

  public getWorkTypes(): Observable<WorkType[]> {
    return this.http.get<WorkType[]>(API_ENDPOINTS.orders.workTypes);
  }

  public create(request: CreateAppointmentRequest): Observable<AppointmentApiResponse> {
    return this.http.post<AppointmentApiResponse>(API_ENDPOINTS.orders.list, {
      car: request.car,
      work_type: request.workType,
      appointmentAt: request.appointmentAt,
      description: request.description,
    });
  }
}
