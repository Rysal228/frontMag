import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { Car } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';
import { CurrentRoleStore } from 'app/shared/storage/current-role-store';
import { UserRole } from 'app/shared/types/roles.types';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [RouterLink, TuiButton, TuiIcon],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsPageComponent {
  private readonly carService = inject(CarService);
  private readonly currentRoleStore = inject(CurrentRoleStore);

  protected readonly cars = signal<Car[]>([]);
  protected readonly isStaffRole = computed(() => {
    const role = this.currentRoleStore.role();

    return role === UserRole.Mechanic || role === UserRole.Admin;
  });

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

  private loadCars(page: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.carService
      .getPage(page)
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
