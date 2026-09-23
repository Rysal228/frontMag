import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NewsApiService } from 'app/shared/api/news-api.service';
import { NewsPage } from 'app/shared/models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly newsApiService = inject(NewsApiService);

  public getAll(offset = 0, limit = 10): Observable<NewsPage> {
    return this.newsApiService.getAll(offset, limit);
  }
}
