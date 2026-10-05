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
  OrderFilterPermissions,
  OrderFilters,
} from 'app/shared/models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);

  public getAll(page = 1, filters?: OrderFilters): Observable<AppointmentPage> {
    const params = this.buildParams(page, filters);

    return this.http.get<AppointmentPage>(API_ENDPOINTS.orders.list, { params });
  }

  public getByCarId(carId: string, page = 1, filters?: OrderFilters): Observable<AppointmentPage> {
    const params = this.buildParams(page, filters);

    return this.http.get<AppointmentPage>(API_ENDPOINTS.cars.orders(carId), { params });
  }

  public getFilterPermissions(): Observable<OrderFilterPermissions> {
    return this.http.get<OrderFilterPermissions>(API_ENDPOINTS.orders.filterPermissions);
  }

  public getWorkTypes(): Observable<WorkType[]> {
    return this.http.get<WorkType[]>(API_ENDPOINTS.orders.workTypes);
  }

  public getStatuses(): Observable<import('app/shared/models/appointment.model').OrderStatus[]> {
    return this.http.get<import('app/shared/models/appointment.model').OrderStatus[]>(API_ENDPOINTS.orders.statuses);
  }

  public getWorkStatuses(): Observable<import('app/shared/models/appointment.model').WorkStatus[]> {
    return this.http.get<import('app/shared/models/appointment.model').WorkStatus[]>(API_ENDPOINTS.orders.workStatuses);
  }

  private buildParams(page: number, filters?: OrderFilters): HttpParams {
    let params = new HttpParams().set('page', page);

    if (!filters) {
      return params;
    }

    const values: Record<string, string | number | null> = {
      search: filters.search || null,
      order_number: filters.orderNumber || null,
      vin: filters.vin || null,
      plate_number: filters.plateNumber || null,
      brand: filters.brandId,
      model: filters.modelId,
      work_type: filters.workTypeId,
      status: filters.statusId,
      work_status: filters.workStatusId,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params = params.set(key, value);
      }
    });

    return params;
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.list, request);
  }

  public getAvailability(date: string): Observable<AppointmentAvailability> {
    const params = new HttpParams().set('date', date);

    return this.http.get<AppointmentAvailability>(API_ENDPOINTS.orders.availability, { params });
  }
}
