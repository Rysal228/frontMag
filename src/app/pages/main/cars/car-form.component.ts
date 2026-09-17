import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { Car, CarBrand, CarModel } from 'app/shared/models/car.model';
import { CarService } from 'app/shared/services/car.service';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule, RouterLink, SelectComponent, TextFieldComponent, TuiButton],
  templateUrl: './car-form.component.html',
  styleUrl: './car-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarFormComponent {
  private readonly carService = inject(CarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentYear = new Date().getFullYear();

  protected readonly carId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = Boolean(this.carId);
  protected readonly brands = signal<CarBrand[]>([]);
  protected readonly models = signal<CarModel[]>([]);
  protected readonly isLoading = signal(this.isEdit);
  protected readonly isSaving = signal(false);
  protected readonly isModelsLoading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly selectedPhoto = signal<File | null>(null);
  protected readonly photoPreview = signal<string | null>(null);

  protected readonly brandOptions = computed<SelectOption[]>(() =>
    this.brands().map((brand) => ({
      value: String(brand.id),
      label: brand.name,
    }))
  );

  protected readonly modelOptions = computed<SelectOption[]>(() =>
    this.models().map((model) => ({
      value: String(model.id),
      label: model.name,
    }))
  );

  protected readonly yearOptions: SelectOption[] = Array.from(
    { length: this.currentYear + 2 - 1900 },
    (_, index) => {
      const year = this.currentYear + 1 - index;

      return {
        value: String(year),
        label: String(year),
      };
    }
  );

  protected readonly form = new FormGroup({
    brand: new FormControl('', { nonNullable: true, validators: Validators.required }),
    model: new FormControl('', { nonNullable: true, validators: Validators.required }),
    year: new FormControl('', { nonNullable: true, validators: Validators.required }),
    plateNumber: new FormControl('', { nonNullable: true, validators: Validators.required }),
    vin: new FormControl('', { nonNullable: true, validators: Validators.maxLength(64) }),
  });

  constructor() {
    this.form.controls.brand.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((brandId) => {
      this.form.controls.model.reset('');

      if (brandId) {
        this.loadModels(Number(brandId));
      } else {
        this.models.set([]);
      }
    });

    this.loadBrands();

    if (this.carId) {
      this.loadCar(this.carId);
    }
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (this.photoPreview()) {
      URL.revokeObjectURL(this.photoPreview()!);
    }

    this.selectedPhoto.set(file);
    this.photoPreview.set(URL.createObjectURL(file));
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const { brand, model, year, plateNumber, vin } = this.form.getRawValue();
    const request = {
      brand: Number(brand),
      model: Number(model),
      year: Number(year),
      plateNumber: plateNumber.trim() || null,
      vin: vin.trim() || null,
      photo: this.selectedPhoto(),
    };

    this.isSaving.set(true);

    const request$ = this.carId
      ? this.carService.update(this.carId, request)
      : this.carService.create(request);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (car) => void this.router.navigate(['/cars', car.id]),
    });
  }

  private loadBrands(): void {
    this.carService.getBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: () => this.loadError.set(true),
    });
  }

  private loadModels(brandId: number, selectedModelId?: number): void {
    this.isModelsLoading.set(true);

    this.carService
      .getModels(brandId)
      .pipe(finalize(() => this.isModelsLoading.set(false)))
      .subscribe({
        next: (models) => {
          this.models.set(models);

          if (selectedModelId) {
            this.form.controls.model.setValue(String(selectedModelId), { emitEvent: false });
          }
        },
        error: () => this.loadError.set(true),
      });
  }

  private loadCar(id: string): void {
    this.carService.getById(id).subscribe({
      next: (car) => this.patchCar(car),
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private patchCar(car: Car): void {
    this.form.patchValue(
      {
        brand: String(car.brand),
        year: String(car.year),
        plateNumber: car.plateNumber ?? '',
        vin: car.vin ?? '',
      },
      { emitEvent: false }
    );

    this.loadModels(car.brand, car.model);
    this.photoPreview.set(car.photo);
    this.isLoading.set(false);
  }
}
