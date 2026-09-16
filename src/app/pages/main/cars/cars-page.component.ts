import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { Car } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [RouterLink, TuiButton],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsPageComponent {
  private readonly carService = inject(CarService);

  protected readonly cars = signal<Car[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  constructor() {
    this.loadCars();
  }

  protected reload(): void {
    this.loadCars();
  }

  private loadCars(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.carService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (cars) => this.cars.set(cars),
        error: () => this.hasError.set(true),
      });
  }
}
