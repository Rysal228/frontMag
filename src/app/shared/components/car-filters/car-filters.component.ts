import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map, Subject, switchMap, takeUntil, timer } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';
import { TuiBadgeNotification, TuiBadgedContent } from '@taiga-ui/kit';

import { CarFiltersModalComponent } from 'app/shared/components/car-filters/car-filters-modal/car-filters-modal.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { PHONE_MASKITO_OPTIONS } from 'app/shared/masks/phone-maskito';
import { CarBrand, CarFilters, CarModel } from 'app/shared/models/car.model';
import { normalizePhone } from 'app/shared/utils/phone-normalize.util';

const EMPTY_FILTERS: CarFilters = {
  status: 'active',
  ownerPhone: '',
  brandId: null,
  modelId: null,
  year: null,
  vin: '',
  plateNumber: '',
};

@Component({
  selector: 'app-car-filters',
  standalone: true,
  imports: [
    CarFiltersModalComponent,
    FormFieldComponent,
    FormsModule,
    TextFieldComponent,
    TuiBadgeNotification,
    TuiBadgedContent,
    TuiButton,
  ],
  templateUrl: './car-filters.component.html',
  styleUrl: './car-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly phoneSearch$ = new Subject<string>();
  private readonly cancelPhoneSearch$ = new Subject<void>();

  public readonly isStaff = input(false);
  public readonly defaultStatus = input<CarFilters['status']>('active');
  public readonly appliedFilters = input.required<CarFilters>();
  public readonly brands = input<CarBrand[]>([]);
  public readonly models = input<CarModel[]>([]);
  public readonly filtersChange = output<CarFilters>();

  protected readonly filters = signal<CarFilters>({ ...EMPTY_FILTERS });
  protected readonly isModalOpen = signal(false);
  protected readonly phoneMaskitoOptions = PHONE_MASKITO_OPTIONS;

  constructor() {
    this.phoneSearch$
      .pipe(
        switchMap((value) =>
          timer(350).pipe(
            map(() => value),
            takeUntil(this.cancelPhoneSearch$)
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.applyPhoneSearch(value));

    effect(() => this.filters.set({ ...this.appliedFilters() }));
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected onModalFiltersChange(filters: CarFilters): void {
    this.filters.set(filters);
    this.filtersChange.emit({ ...filters });
  }

  protected onOwnerPhoneSearch(value: string): void {
    this.filters.update((current) => ({ ...current, ownerPhone: value }));
    this.phoneSearch$.next(value);
  }

  protected resetAll(): void {
    this.cancelPhoneSearch$.next();
    const cleared: CarFilters = {
      ...EMPTY_FILTERS,
      status: this.defaultStatus(),
    };
    this.filters.set(cleared);
    this.isModalOpen.set(false);
    this.emit();
  }

  protected activeFilterCount(): number {
    const filters = this.filters();

    return [
      filters.status !== this.defaultStatus() ? filters.status : null,
      filters.brandId,
      filters.modelId,
      filters.year,
      filters.vin,
      filters.plateNumber,
    ].filter((value) => value !== null && value !== '').length;
  }

  private applyPhoneSearch(value: string): void {
    if (!value) {
      this.emit();
      return;
    }

    const normalizedPhone = normalizePhone(value);

    this.filters.update((current) => ({
      ...current,
      ownerPhone: normalizedPhone,
    }));
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({ ...this.filters() });
  }
}
