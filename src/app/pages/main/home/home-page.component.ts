import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { News } from 'app/shared/models/news.model';
import { NewsService } from 'app/shared/services/news.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DatePipe, TuiButton],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly newsService = inject(NewsService);

  protected readonly news = signal<News[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  constructor() {
    this.loadNews();
  }

  protected reload(): void {
    this.loadNews();
  }

  private loadNews(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.newsService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (news) => this.news.set(news),
        error: () => this.hasError.set(true),
      });
  }
}
