import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { StatisticsDashboard, StatisticsPeriod } from 'app/shared/models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsApiService {
  private readonly http = inject(HttpClient);

  public getDashboard(days: StatisticsPeriod): Observable<StatisticsDashboard> {
    return this.http.get<StatisticsDashboard>(API_ENDPOINTS.orders.statistics, {
      params: new HttpParams().set('days', days),
    });
  }
}
