import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, Subscription, catchError, expand, finalize, of, reduce, switchMap } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { Appointment, OrderFilters } from 'app/shared/models/appointment.model';
import { News } from 'app/shared/models/news.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { NewsService } from 'app/shared/services/news.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DatePipe, RouterLink, TuiButton],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnDestroy {
  private static readonly NEWS_LIMIT = 10;
  private readonly newsService = inject(NewsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly currentRole = inject(CurrentRoleStore);
  private readonly currentUser = inject(CurrentUserStore);

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
  protected readonly role = this.currentRole.role;
  protected readonly userRole = UserRole;
  protected readonly isAppointmentsLoading = signal(true);
  protected readonly appointmentsError = signal(false);
  private readonly allUpcoming = signal<Appointment[]>([]);
  protected readonly upcoming = computed(() => {
    const role = this.role();
    const userId = this.currentUser.user()?.id;
    const orders = this.allUpcoming();

    if (role === UserRole.Mechanic) {
      return userId ? orders.filter((order) => order.mechanics.includes(userId)).slice(0, 4) : [];
    }

    return orders.slice(0, role === UserRole.User ? 1 : 4);
  });

  protected readonly nearest = computed(() => this.upcoming()[0] ?? null);

  private offset = 0;

  constructor() {
    this.loadNews();

    effect((onCleanup) => {
      if (this.role()) {
        const subscription = untracked(() => this.loadUpcoming());
        onCleanup(() => subscription.unsubscribe());
      }
    });
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

  protected reloadUpcoming(): void {
    this.loadUpcoming();
  }

  protected retryLoadMore(): void {
    this.hasError.set(false);
    this.loadMore();
  }

  private loadUpcoming(): Subscription {
    this.isAppointmentsLoading.set(true);
    this.appointmentsError.set(false);

    const now = new Date();
    const serviceTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const from = serviceTime.toISOString().slice(0, 10);
    serviceTime.setUTCDate(serviceTime.getUTCDate() + (this.role() === UserRole.User ? 180 : 14));
    const to = serviceTime.toISOString().slice(0, 10);
    const windowEnd = serviceTime.getTime() - 7 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;
    const dateFilters: OrderFilters = {
      search: '',
      orderNumber: '',
      vin: '',
      plateNumber: '',
      brandId: null,
      modelId: null,
      workTypeId: null,
      statusId: null,
      workStatusId: null,
      dateFrom: from,
      dateTo: to,
    };

    return this.appointmentService
      .getFilterPermissions()
      .pipe(
        catchError(() => of(null)),
        switchMap((permissions) => {
          const filters = permissions?.date_range ? dateFilters : undefined;
          return this.appointmentService.getAll(1, filters).pipe(
            expand((page, index) => (page.next ? this.appointmentService.getAll(index + 2, filters) : EMPTY)),
            reduce((items, page) => [...items, ...page.results], [] as Appointment[])
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAppointmentsLoading.set(false))
      )
      .subscribe({
        next: (orders) => {
          const currentTime = Date.now();
          this.allUpcoming.set(
            orders
              .filter(
                (order) =>
                  new Date(order.appointmentAt).getTime() >= currentTime &&
                  new Date(order.appointmentAt).getTime() < windowEnd &&
                  !['completed', 'cancelled', 'rejected'].includes(order.status.code ?? '')
              )
              .sort((a, b) => new Date(a.appointmentAt).getTime() - new Date(b.appointmentAt).getTime())
          );
        },
        error: () => this.appointmentsError.set(true),
      });
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
      }
    );

    this.observer.observe(element);
  }

  private loadNews(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.newsService
      .getAll(0, HomePageComponent.NEWS_LIMIT)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
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
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingMore.set(false))
      )
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
