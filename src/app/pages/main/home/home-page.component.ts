import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
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
export class HomePageComponent implements OnDestroy {
  private static readonly NEWS_LIMIT = 10;
  private readonly newsService = inject(NewsService);

  private observer?: IntersectionObserver;

  @ViewChild('loadMoreTrigger')
  private set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    if (!element) {
      return;
    }

    this.createObserver(element.nativeElement);
  }

  protected readonly news = signal<News[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly hasError = signal(false);
  protected readonly hasMore = signal(true);

  private offset = 0;

  constructor() {
    this.loadNews();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected reload(): void {
    this.observer?.disconnect();
    this.offset = 0;
    this.news.set([]);
    this.hasMore.set(true);
    this.loadNews();
  }

  private createObserver(element: HTMLElement): void {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.loadMore();
        }
      },
      {
        rootMargin: '0px 0px 300px',
      },
    );

    this.observer.observe(element);
  }

  private loadNews(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.newsService
      .getAll(0, HomePageComponent.NEWS_LIMIT)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (page) => {
          this.news.set(page.results);
          this.offset = page.results.length;
          this.hasMore.set(page.next !== null);
        },
        error: () => this.hasError.set(true),
      });
  }

  private loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) {
      return;
    }

    this.isLoadingMore.set(true);

    this.newsService
      .getAll(this.offset, HomePageComponent.NEWS_LIMIT)
      .pipe(finalize(() => this.isLoadingMore.set(false)))
      .subscribe({
        next: (page) => {
          this.news.update((items) => [...items, ...page.results]);
          this.offset += page.results.length;
          this.hasMore.set(page.next !== null);
        },
        error: () => this.hasError.set(true),
      });
  }
}
