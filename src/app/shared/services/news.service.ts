import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NewsApiService } from 'app/shared/api/news-api.service';
import { News } from 'app/shared/models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly newsApiService = inject(NewsApiService);

  public getAll(): Observable<News[]> {
    return this.newsApiService.getAll();
  }

  public getById(id: number): Observable<News> {
    return this.newsApiService.getById(id);
  }
}
