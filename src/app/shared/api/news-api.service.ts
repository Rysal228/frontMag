import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { News, NewsPage } from 'app/shared/models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsApiService {
  private readonly http = inject(HttpClient);

  public getAll(offset = 0, limit = 10): Observable<NewsPage> {
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);

    return this.http.get<NewsPage>(API_ENDPOINTS.news.list, {params});
  }

  public getById(id: number): Observable<News> {
    return this.http.get<News>(API_ENDPOINTS.news.details(id));
  }
}
