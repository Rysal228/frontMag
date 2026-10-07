import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { Car, CarBrand, CarFilters, CarModel } from 'app/shared/models/car.model';
import { CarFiltersComponent } from 'app/shared/components/car-filters/car-filters.component';
import { CarService } from 'app/shared/services/car.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [CarFiltersComponent, RouterLink, TuiButton, TuiIcon],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsPageComponent {
  private readonly carService = inject(CarService);
  private readonly currentRoleStore = inject(CurrentRoleStore);

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

  protected readonly pageItems = computed<(number | 'ellipsis')[]>(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage]);

    for (const page of [currentPage - 1, currentPage + 1]) {
      if (page > 1 && page < totalPages) {
        pages.add(page);
      }
    }

    const sortedPages = [...pages].sort((a, b) => a - b);
    const result: (number | 'ellipsis')[] = [];

    sortedPages.forEach((page, index) => {
      if (index > 0 && page - sortedPages[index - 1] > 1) {
        result.push('ellipsis');
      }

      result.push(page);
    });

    return result;
  });

  constructor() {
    this.filters.update((current) => ({
      ...current,
      status: this.defaultStatus(),
    }));

    this.loadFilterOptions();
    this.loadCars(1);
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

  protected goToPage(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages() || this.isLoading()) {
      return;
    }

    this.loadCars(page);
  }

  private loadFilterOptions(): void {
    forkJoin({
      brands: this.carService.getBrands(),
      models: this.carService.getModels(),
    }).subscribe({
      next: ({ brands, models }) => {
        this.brands.set(brands);
        this.models.set(models);
      },
    });
  }

  private loadCars(page: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.carService
      .getPage(page, this.filters())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.currentPage.set(page);
          this.totalItems.set(response.count);
          this.cars.set(response.results);
        },
        error: () => this.hasError.set(true),
      });
  }
}
