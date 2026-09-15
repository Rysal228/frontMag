import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { OrderStatus } from 'app/shared/models/order-status.model';

@Injectable({
  providedIn: 'root',
})
export class OrderStatusService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<OrderStatus[]> {
    return this.http.get<OrderStatus[]>(API_ENDPOINTS.orders.statuses);
  }
}
