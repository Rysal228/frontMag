import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
export class CarFiltersComponent implements OnInit {
  private readonly phoneSearch$ = new Subject<string>();

  public readonly isStaff = input(false);
  public readonly defaultStatus = input<CarFilters['status']>('active');
  public readonly brands = input<CarBrand[]>([]);
  public readonly models = input<CarModel[]>([]);
  public readonly filtersChange = output<CarFilters>();

  protected readonly filters = signal<CarFilters>({ ...EMPTY_FILTERS });
  protected readonly isModalOpen = signal(false);
  protected readonly phoneMaskitoOptions = PHONE_MASKITO_OPTIONS;

  constructor() {
    this.phoneSearch$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((value) => this.applyPhoneSearch(value));
  }

  ngOnInit(): void {
    this.filters.update((current) => ({
      ...current,
      status: this.defaultStatus(),
    }));
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
    this.filters.set({
      ...EMPTY_FILTERS,
      status: this.defaultStatus(),
    });
    this.isModalOpen.set(false);
    this.phoneSearch$.next('');
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

    if (normalizedPhone.replace(/\D/g, '').length !== 11) {
      return;
    }

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
