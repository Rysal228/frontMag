import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, finalize, forkJoin, switchMap, tap } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';

import { CarFiltersComponent } from 'app/shared/components/car-filters/car-filters.component';
import { Car, CarBrand, CarFilters, CarModel } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [CarFiltersComponent, RouterLink, TuiButton, TuiPagination],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsPageComponent {
  private readonly carService = inject(CarService);
  private readonly currentRoleStore = inject(CurrentRoleStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly carRequests$ = new Subject<{ page: number; filters: CarFilters }>();

  protected readonly cars = signal<Car[]>([]);
  protected readonly brands = signal<CarBrand[]>([]);
  protected readonly models = signal<CarModel[]>([]);
  protected readonly filters = signal<CarFilters>({
    status: 'active',
    ownerPhone: '',
    brandId: null,
    modelId: null,
    year: null,
    vin: '',
    plateNumber: '',
  });

  protected readonly isManagerRole = computed(() => this.currentRoleStore.role() === UserRole.Admin);

  protected readonly isStaffRole = computed(() => {
    const role = this.currentRoleStore.role();

    return role === UserRole.Mechanic || role === UserRole.Admin;
  });

  protected readonly defaultStatus = computed<CarFilters['status']>(() =>
    this.currentRoleStore.role() === UserRole.Admin ? 'all' : 'active'
  );

  protected readonly title = computed(() => {
    const role = this.currentRoleStore.role();

    if (role === UserRole.User) {
      return 'Мои автомобили';
    } else if (role === UserRole.Mechanic) {
      return 'Обслуживаемые автомобили';
    } else if (role === UserRole.Admin) {
      return 'Автомобили сервиса';
    } else {
      return 'Автомобили';
    }
  });

  protected readonly subtitle = computed(() => {
    const role = this.currentRoleStore.role();

    if (role === UserRole.User) {
      return 'Автомобили, привязанные к аккаунту';
    } else if (role === UserRole.Mechanic) {
      return 'Автомобили, которые необходимо обслужить';
    } else if (role === UserRole.Admin) {
      return 'Автомобили, числящиеся у пользователей и находящиеся на обслуживании';
    } else {
      return '';
    }
  });

  protected readonly emptyTitle = computed(() => {
    const status = this.filters().status;

    if (status === 'archived') {
      return 'Архивных автомобилей нет';
    }

    if (status === 'all') {
      return 'Автомобилей не найдено';
    }

    return this.isStaffRole() ? 'Автомобилей на обслуживании пока нет' : 'У вас пока нет автомобилей';
  });

  protected readonly currentPage = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  protected readonly totalPages = computed(() => Math.ceil(this.totalItems() / 10));

  constructor() {
    this.carRequests$
      .pipe(
        switchMap(({ page, filters }) => {
          this.isLoading.set(true);
          this.hasError.set(false);

          return this.carService.getPage(page, filters).pipe(
            tap((response) => {
              this.currentPage.set(page);
              this.totalItems.set(response.count);
              this.cars.set(response.results);
            }),
            catchError(() => {
              this.hasError.set(true);
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.loadFilterOptions();

    effect(() => {
      const role = this.currentRoleStore.role();
      if (!role) {
        return;
      }

      untracked(() => {
        this.filters.set({
          status: role === UserRole.Admin ? 'all' : 'active',
          ownerPhone: '',
          brandId: null,
          modelId: null,
          year: null,
          vin: '',
          plateNumber: '',
        });
        this.loadCars(1);
      });
    });
  }

  protected getStatusLabel(status: Car['status']): string {
    return status === 'archived' ? 'Архив' : 'Активный';
  }

  protected onFiltersChange(filters: CarFilters): void {
    this.filters.set(filters);
    this.loadCars(1);
  }

  protected reload(): void {
    this.loadCars(this.currentPage());
  }

  protected onPageChange(pageIndex: number): void {
    const page = pageIndex + 1;
    if (page === this.currentPage() || page < 1 || page > this.totalPages() || this.isLoading()) {
      return;
    }

    this.loadCars(page);
  }

  private loadFilterOptions(): void {
    forkJoin({
      brands: this.carService.getBrands(),
      models: this.carService.getModels(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ brands, models }) => {
          this.brands.set(brands);
          this.models.set(models);
        },
      });
  }

  private loadCars(page: number): void {
    this.carRequests$.next({ page, filters: { ...this.filters() } });
  }
}
