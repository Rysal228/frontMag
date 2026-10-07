import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiButton } from '@taiga-ui/core';

import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { CarBrand, CarFilters, CarModel } from 'app/shared/models/car.model';

const EMPTY_FILTERS: CarFilters = {
  status: 'active',
  ownerPhone: '',
  brandId: null,
  modelId: null,
  year: null,
  vin: '',
  plateNumber: '',
};

const ALL_ID = 'all';

@Component({
  selector: 'app-car-filters-modal',
  standalone: true,
  imports: [FormFieldComponent, FormsModule, SelectComponent, TextFieldComponent, TuiButton],
  templateUrl: './car-filters-modal.component.html',
  styleUrl: './car-filters-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarFiltersModalComponent implements OnInit {
  public readonly filters = input.required<CarFilters>();
  public readonly defaultStatus = input<CarFilters['status']>('active');
  public readonly brands = input<CarBrand[]>([]);
  public readonly models = input<CarModel[]>([]);

  public readonly closed = output<void>();
  public readonly filtersChange = output<CarFilters>();

  protected readonly draftFilters = signal<CarFilters>({ ...EMPTY_FILTERS });

  ngOnInit(): void {
    this.draftFilters.set({ ...this.filters() });
  }

  protected availableModels(): CarModel[] {
    const brandId = this.draftFilters().brandId;

    return brandId ? this.models().filter((model) => model.brand === brandId) : [];
  }

  protected selectValue(value: number | null): string {
    return value === null ? ALL_ID : String(value);
  }

  protected statusValue(): string {
    return this.draftFilters().status;
  }

  protected onStatusChange(value: string): void {
    this.update('status', value as CarFilters['status']);
  }

  protected onBrandChange(value: string): void {
    const brandId = value === ALL_ID ? null : Number(value);

    this.draftFilters.update((current) => ({
      ...current,
      brandId,
      modelId: null,
    }));
  }

  protected onModelChange(value: string): void {
    this.update('modelId', value === ALL_ID ? null : Number(value));
  }

  protected onYearChange(value: string): void {
    const normalized = value.trim();

    this.update('year', normalized ? Number(normalized) : null);
  }

  protected update<K extends keyof CarFilters>(key: K, value: CarFilters[K]): void {
    this.draftFilters.update((current) => ({ ...current, [key]: value }));
  }

  protected statusOptions(): SelectOption[] {
    return [
      { value: 'active', label: 'Активные' },
      { value: 'archived', label: 'Архивные' },
      { value: 'all', label: 'Все' },
    ];
  }

  protected brandOptions(): SelectOption[] {
    return [
      { value: ALL_ID, label: 'Все марки' },
      ...this.brands().map((brand) => ({ value: String(brand.id), label: brand.name })),
    ];
  }

  protected modelOptions(): SelectOption[] {
    return [
      { value: ALL_ID, label: 'Все модели' },
      ...this.availableModels().map((model) => ({ value: String(model.id), label: model.name })),
    ];
  }

  protected reset(): void {
    this.draftFilters.set({
      ...EMPTY_FILTERS,
      status: this.defaultStatus(),
    });
  }

  protected apply(): void {
    this.filtersChange.emit({ ...this.draftFilters() });
    this.closed.emit();
  }

  protected close(): void {
    this.closed.emit();
  }
}
