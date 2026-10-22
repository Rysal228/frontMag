import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { TuiAxes, TuiBarChart, TuiLineChart, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiButton } from '@taiga-ui/core';

import { StatisticsApiService } from 'app/shared/api/statistics-api.service';
import { StatisticsDashboard, StatisticsPeriod } from 'app/shared/models/statistics.model';

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [TuiAxes, TuiBarChart, TuiButton, TuiLineChart, TuiRingChart],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPageComponent {
  private readonly api = inject(StatisticsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selection$ = new Subject<StatisticsPeriod>();

  protected readonly periods: readonly StatisticsPeriod[] = [7, 30, 90];
  protected readonly period = signal<StatisticsPeriod>(30);
  protected readonly dashboard = signal<StatisticsDashboard | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  protected readonly trendPoints = computed<Array<[number, number]>>(() =>
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
      const at = Math.round(index * (trend.length - 1) / Math.max(1, ticks - 1));
      const date = trend[at]?.date ?? '';
      return date.length === 10 ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : date;
    });
  });

  protected readonly statusCounts = computed(() => (this.dashboard()?.statusDistribution ?? []).map((item) => item.count));
  protected readonly workCounts = computed(() => (this.dashboard()?.topWorkTypes ?? []).map((item) => item.count));
  protected readonly workLabels = computed(() => this.workCounts().map((_, index) => String(index + 1)));
  protected readonly workMax = computed(() => Math.max(1, ...this.workCounts()));
  protected readonly workYLabels = computed(() => ['0', String(this.workMax())]);
  protected readonly weekdayPercentages = computed(() => (this.dashboard()?.weekdayOccupancy ?? []).map((item) => item.percent));
  protected readonly weekdayLabels = computed(() => (this.dashboard()?.weekdayOccupancy ?? []).map((item) => item.weekdayName));

  protected readonly formatRubles = (value: number): string =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);

  protected readonly formatDay = (value: number): string => {
    const date = this.dashboard()?.ordersTrend[Math.round(value)]?.date;
    return date ? `${date.slice(8, 10)}.${date.slice(5, 7)}` : '';
  };

  constructor() {
    this.selection$
      .pipe(
        startWith(30 as StatisticsPeriod),
        tap(() => {
          this.isLoading.set(true);
          this.hasError.set(false);
        }),
        switchMap((days) =>
          this.api.getDashboard(days).pipe(
            catchError(() => {
              this.hasError.set(true);
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.dashboard.set(response);
        this.isLoading.set(false);
      });
  }

  protected setPeriod(days: StatisticsPeriod): void {
    if (this.period() !== days) {
      this.period.set(days);
      this.selection$.next(days);
    }
  }

  protected retry(): void {
    this.selection$.next(this.period());
  }
}
