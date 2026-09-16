import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

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

    if (!window.confirm('Удалить этот автомобиль?')) {
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
