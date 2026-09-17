import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TUI_CONFIRM } from '@taiga-ui/kit';
import { TuiButton, TuiDialogService } from '@taiga-ui/core';

import { Car } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [RouterLink, TuiButton],
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
  protected readonly isLoading = signal(true);
  protected readonly isDeleting = signal(false);
  protected readonly hasError = signal(false);

  private readonly carId = this.route.snapshot.paramMap.get('id');

  constructor() {
    if (!this.carId) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.carService
      .getById(this.carId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (car) => this.car.set(car),
        error: () => this.hasError.set(true),
      });
  }

  protected deleteCar(): void {
    if (!this.carId || this.isDeleting()) {
      return;
    }

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удаление автомобиля',
        data: {
          content: 'Вы действительно хотите удалить этот автомобиль? Это действие нельзя отменить.',
          yes: 'Удалить',
          no: 'Отмена',
          appearance: 'negative',
        },
      })
      .subscribe({
        next: () => this.deleteConfirmed(),
      });
  }

  private deleteConfirmed(): void {
    if (!this.carId || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);

    this.carService
      .delete(this.carId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/cars'),
      });
  }
}
