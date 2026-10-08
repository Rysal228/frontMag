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
  OrderStatus,
  WorkStatus,
  OrderPermissions,
  PaymentStatus,
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

  public getWorkTypes(search = ''): Observable<WorkType[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<WorkType[]>(API_ENDPOINTS.orders.workTypes, { params });
  }

  public getStatuses(): Observable<OrderStatus[]> {
    return this.http.get<OrderStatus[]>(API_ENDPOINTS.orders.statuses);
  }

  public getWorkStatuses(): Observable<WorkStatus[]> {
    return this.http.get<WorkStatus[]>(API_ENDPOINTS.orders.workStatuses);
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

  public getById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${API_ENDPOINTS.orders.list}${id}/`);
  }

  public getPermissions(id: string): Observable<OrderPermissions> {
    return this.http.get<OrderPermissions>(API_ENDPOINTS.orders.permissions(id));
  }

  public transitionStatus(id: string, statusId: number): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.transitionStatus(id), { statusId });
  }

  public transitionWorkStatus(id: string, statusId: number): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.transitionWorkStatus(id), { statusId });
  }

  public updateMechanics(id: string, mechanics: string[]): Observable<Appointment> {
    return this.http.patch<Appointment>(`${API_ENDPOINTS.orders.list}${id}/`, { mechanics });
  }

  public setPaymentStatus(id: string, statusId: number): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.paymentStatus(id), { statusId });
  }

  public getPaymentStatuses(): Observable<PaymentStatus[]> {
    return this.http.get<PaymentStatus[]>(API_ENDPOINTS.orders.paymentStatuses);
  }

  public create(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(API_ENDPOINTS.orders.list, request);
  }

  public getAvailability(date: string): Observable<AppointmentAvailability> {
    const params = new HttpParams().set('date', date);

    return this.http.get<AppointmentAvailability>(API_ENDPOINTS.orders.availability, { params });
  }
}