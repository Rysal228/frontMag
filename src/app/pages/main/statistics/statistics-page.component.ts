import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, Subject, switchMap, tap } from 'rxjs';

import { TuiAxes, TuiBar, TuiBarChart, TuiLineChart, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { StatisticsApiService } from 'app/shared/api/statistics-api.service';
import { FeedbackStatisticsDashboard, StatisticsDashboard, StatisticsPeriod } from 'app/shared/models/statistics.model';

type StatisticsSelection = { days: StatisticsPeriod; page: number; reviewsOnly: boolean };
type ReviewSentiment = { band: 'high' | 'neutral' | 'low'; label: string; range: string; count: number };

const ratingRange = (from: number, to: number): string => (from === to ? `${from} из 5` : `${from}–${to} из 5`);

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [
    RouterLink,
    TuiAxes,
    TuiBar,
    TuiBarChart,
    TuiButton,
    TuiHint,
    TuiIcon,
    TuiLineChart,
    TuiPagination,
    TuiRingChart,
  ],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPageComponent {
  private readonly api = inject(StatisticsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selection$ = new Subject<StatisticsSelection>();

  protected readonly periods = signal<readonly StatisticsPeriod[]>([]);
  protected readonly period = signal<StatisticsPeriod | null>(null);
  protected readonly dashboard = signal<StatisticsDashboard | null>(null);
  protected readonly feedback = signal<FeedbackStatisticsDashboard | null>(null);
  protected readonly feedbackError = signal(false);
  protected readonly reviewsLoading = signal(false);
  protected readonly reviewsPageError = signal(false);
  private readonly failedReviewsPage = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected readonly trendPoints = computed<[number, number][]>(() =>
    (this.dashboard()?.ordersTrend ?? []).map((point, index): [number, number] => [index, point.count])
  );
  protected readonly trendWidth = computed(() => Math.max(this.trendPoints().length - 1, 1));
  protected readonly trendMax = computed(() =>
    Math.max(1, Math.ceil(Math.max(0, ...this.trendPoints().map(([, value]) => value)) * 1.2))
  );
  protected readonly trendYLabels = computed(() => {
    const max = this.trendMax();
    return ['0', String(Math.round(max / 2)), String(max)];
  });
  protected readonly trendXLabels = computed(() => {
    const trend = this.dashboard()?.ordersTrend ?? [];
    if (!trend.length) {
      return [];
    }
    const ticks = Math.min(trend.length, 5);
    return Array.from({ length: ticks }, (_, index) => {
      const at = Math.round((index * (trend.length - 1)) / Math.max(1, ticks - 1));
      const date = trend[at]?.date ?? '';
      return date.length === 10 ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : date;
    });
  });

  protected readonly statusCounts = computed(() =>
    (this.dashboard()?.statusDistribution ?? []).map((item) => item.count)
  );
  protected readonly workCounts = computed(() => (this.dashboard()?.topWorkTypes ?? []).map((item) => item.count));
  protected readonly workLabels = computed(() => this.workCounts().map((_, index) => String(index + 1)));
  protected readonly workMax = computed(() => Math.max(1, ...this.workCounts()));
  protected readonly workYLabels = computed(() => ['0', String(this.workMax())]);
  protected readonly weekdayPercentages = computed(() =>
    (this.dashboard()?.weekdayOccupancy ?? []).map((item) => item.percent)
  );
  protected readonly weekdayLabels = computed(() =>
    (this.dashboard()?.weekdayOccupancy ?? []).map((item) => item.weekdayName)
  );

  protected readonly ratingCounts = computed(() => (this.feedback()?.distribution ?? []).map((item) => item.count));
  protected readonly ratingLabels = computed(() =>
    (this.feedback()?.distribution ?? []).map((item) => String(item.rating))
  );
  protected readonly ratingMax = computed(() => Math.max(1, ...this.ratingCounts()));
  protected readonly ratingYLabels = computed(() => {
    const max = this.ratingMax();
    return max === 1 ? ['0', '1'] : ['0', String(Math.ceil(max / 2)), String(max)];
  });
  protected readonly reviewSentiments = computed<ReviewSentiment[]>(() => {
    const feedback = this.feedback();
    if (!feedback) {
      return [];
    }

    const { lowMax, highMin } = feedback.thresholds;
    const countInRange = (from: number, to: number): number =>
      feedback.distribution.reduce(
        (total, item) => total + (item.rating >= from && item.rating <= to ? item.count : 0),
        0
      );
    const sentiments: ReviewSentiment[] = [
      {
        band: 'high',
        label: 'Положительные',
        range: ratingRange(highMin, 5),
        count: countInRange(highMin, 5),
      },
    ];

    if (highMin > lowMax + 1) {
      sentiments.push({
        band: 'neutral',
        label: 'Нейтральные',
        range: ratingRange(lowMax + 1, highMin - 1),
        count: countInRange(lowMax + 1, highMin - 1),
      });
    }

    sentiments.push({
      band: 'low',
      label: 'Отрицательные',
      range: ratingRange(1, lowMax),
      count: countInRange(1, lowMax),
    });
    return sentiments;
  });
  protected readonly sentimentCounts = computed(() => this.reviewSentiments().map((item) => item.count));
  protected readonly hasNeutralSentiment = computed(() =>
    this.reviewSentiments().some((item) => item.band === 'neutral')
  );

  protected readonly formatRubles = (value: number): string =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);

  protected readonly ratingHeight = (count: number): number => (count / this.ratingMax()) * 100;

  protected readonly ratingHint = (rating: number, count: number): string => {
    const category = new Intl.PluralRules('ru-RU').select(count);
    const noun = category === 'one' ? 'оценка' : category === 'few' ? 'оценки' : 'оценок';
    return `${rating} из 5 — ${count} ${noun}`;
  };

  protected readonly outcomeLabel = (outcome: 'closed' | 'cancelled'): string =>
    outcome === 'closed' ? 'Заказ завершился успешно' : 'Заказ был отменён';

  protected readonly formatReviewDate = (value: string): string =>
    new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  protected readonly periodLabel = (days: number): string => {
    const category = new Intl.PluralRules('ru-RU').select(days);
    const unit = category === 'one' ? 'день' : category === 'few' ? 'дня' : 'дней';
    return `${days} ${unit}`;
  };

  protected readonly formatDay = (value: number): string => {
    const date = this.dashboard()?.ordersTrend[Math.round(value)]?.date;
    return date ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : '';
  };

  constructor() {
    this.selection$
      .pipe(
        tap(({ reviewsOnly }) => {
          this.reviewsPageError.set(false);
          if (reviewsOnly) {
            this.reviewsLoading.set(true);
          } else {
            this.isLoading.set(true);
            this.reviewsLoading.set(false);
            this.failedReviewsPage.set(null);
            this.hasError.set(false);
            this.feedbackError.set(false);
          }
        }),
        switchMap(({ days, page, reviewsOnly }) => {
          if (reviewsOnly) {
            return this.api.getFeedbackDashboard(days, page).pipe(
              map((feedback) => ({ reviewsOnly, orders: null, feedback })),
              catchError(() => {
                this.reviewsPageError.set(true);
                this.failedReviewsPage.set(page);
                return of({ reviewsOnly, orders: null, feedback: null });
              })
            );
          }

          return forkJoin({
            orders: this.api.getDashboard(days),
            feedback: this.api.getFeedbackDashboard(days).pipe(
              catchError(() => {
                this.feedbackError.set(true);
                return of(null);
              })
            ),
          }).pipe(
            map(({ orders, feedback }) => ({ reviewsOnly, orders, feedback })),
            catchError(() => {
              this.hasError.set(true);
              return of({ reviewsOnly, orders: null, feedback: null });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        if (response.reviewsOnly) {
          if (response.feedback) {
            this.feedback.set(response.feedback);
            this.failedReviewsPage.set(null);
          }
          this.reviewsLoading.set(false);
        } else {
          this.dashboard.set(response.orders);
          this.feedback.set(response.feedback);
          this.isLoading.set(false);
        }
      });

    this.loadPeriods();
  }

  private loadPeriods(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.api
      .getPeriods()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ periods, defaultDays }) => {
          const options = periods.map(({ days }) => days);
          this.periods.set(options);
          const chosen = options.includes(defaultDays ?? NaN) ? defaultDays : (options[0] ?? null);
          this.period.set(chosen);
          if (chosen === null) {
            this.dashboard.set(null);
            this.feedback.set(null);
            this.isLoading.set(false);
            return;
          }
          this.selection$.next({ days: chosen, page: 1, reviewsOnly: false });
        },
        error: () => {
          this.periods.set([]);
          this.period.set(null);
          this.dashboard.set(null);
          this.feedback.set(null);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  protected setPeriod(days: StatisticsPeriod): void {
    if (this.periods().includes(days) && this.period() !== days) {
      this.period.set(days);
      this.selection$.next({ days, page: 1, reviewsOnly: false });
    }
  }

  protected onReviewsPageChange(pageIndex: number): void {
    const days = this.period();
    const pagination = this.feedback()?.reviewsPagination;
    const page = pageIndex + 1;
    if (
      days === null ||
      !pagination ||
      this.isLoading() ||
      this.reviewsLoading() ||
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    this.selection$.next({ days, page, reviewsOnly: true });
  }

  protected retryReviewsPage(): void {
    const days = this.period();
    const page = this.failedReviewsPage();
    if (days !== null && page !== null && !this.reviewsLoading()) {
      this.selection$.next({ days, page, reviewsOnly: true });
    }
  }

  protected retry(): void {
    this.loadPeriods();
  }

  protected retryFeedback(): void {
    const days = this.period();
    if (days !== null) {
      this.selection$.next({ days, page: 1, reviewsOnly: false });
    }
  }
}
