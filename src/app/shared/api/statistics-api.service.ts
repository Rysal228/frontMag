import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { StatisticsDashboard, StatisticsPeriod, StatisticsPeriodsResponse, MechanicStatistics } from 'app/shared/models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsApiService {
  private readonly http = inject(HttpClient);

  public getMechanicStatistics(): Observable<MechanicStatistics> {
    return this.http.get<MechanicStatistics>(API_ENDPOINTS.orders.mechanicStatistics);
  }

  public getPeriods(): Observable<StatisticsPeriodsResponse> {
    return this.http.get<StatisticsPeriodsResponse>(API_ENDPOINTS.orders.statisticsPeriods);
  }

  public getDashboard(days: StatisticsPeriod): Observable<StatisticsDashboard> {
    return this.http.get<StatisticsDashboard>(API_ENDPOINTS.orders.statistics, {
      params: new HttpParams().set('days', days),
    });
  }
}
