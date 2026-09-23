import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { News } from 'app/shared/models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsApiService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<News[]> {
    return this.http.get<News[]>(API_ENDPOINTS.news.list);
  }

  public getById(id: number): Observable<News> {
    return this.http.get<News>(API_ENDPOINTS.news.list + id + '/');
  }
}
