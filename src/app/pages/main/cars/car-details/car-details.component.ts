import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton, TuiDialogService, TuiHint, TuiIcon } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';

import { CarOrderHistoryComponent } from 'app/pages/main/cars/car-details/car-order-history/car-order-history.component';
import { Car } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [RouterLink, TuiButton, TuiHint, TuiIcon, CarOrderHistoryComponent],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetailsComponent {
  private readonly carService = inject(CarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly car = signal<Car | null>(null);
  protected readonly carId = signal<string | null>(null);
  protected readonly previousCar = signal<Car | null>(null);
  protected readonly nextCar = signal<Car | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isDeleting = signal(false);
  protected readonly hasError = signal(false);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      this.carId.set(id);
      this.car.set(null);
      this.previousCar.set(null);
      this.nextCar.set(null);
      this.hasError.set(!id);
      this.isLoading.set(!!id);

      if (!id) {
        return;
      }

      this.carService
        .getById(id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (car) => {
            this.car.set(car);
            this.loadNavigation(id);
          },
          error: () => this.hasError.set(true),
        });
    });
  }

  protected navigateToCar(car: Car | null): void {
    if (!car || car.id === this.carId()) {
      return;
    }

    void this.router.navigate(['/cars', car.id]);
  }

  protected deleteCar(): void {
    if (!this.carId() || this.isDeleting()) {
      return;
    }

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удаление автомобиля',
        data: {
          content: 'Автомобиль будет скрыт из вашего кабинета, а история заказов сохранится. Если после удаления его привяжут к другому аккаунту, для восстановления привязки может потребоваться обращение в поддержку.',
          yes: 'Удалить',
          no: 'Отмена',
          appearance: 'negative',
        },
      })
      .subscribe({
        next: (confirmed) => {
          if (confirmed) {
            this.deleteConfirmed();
          }
        },
      });
  }

  private loadNavigation(id: string): void {
    this.carService.getNavigation(id).subscribe({
      next: (navigation) => {
        this.previousCar.set(navigation.previous);
        this.nextCar.set(navigation.next);
      },
    });
  }

  private deleteConfirmed(): void {
    const id = this.carId();

    if (!id || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);

    this.carService
      .delete(id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/cars'),
      });
  }
}
