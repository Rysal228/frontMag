import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import {
  SelectComponent,
  SelectOption,
} from 'app/shared/components/select/select.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { CarBrand, CarModel } from 'app/shared/models/car.model';
import {
  OrderFilterPermissions,
  OrderFilters,
  OrderStatus,
  WorkStatus,
  WorkType,
} from 'app/shared/models/appointment.model';

export type OrderFilterContext = 'all' | 'car';

const EMPTY_FILTERS: OrderFilters = {
  search: '',
  orderNumber: '',
  vin: '',
  plateNumber: '',
  brandId: null,
  modelId: null,
  workTypeId: null,
  statusId: null,
  workStatusId: null,
  dateFrom: null,
  dateTo: null,
};

const ALL_ID = 0;

@Component({
  selector: 'app-order-filters',
  standalone: true,
  imports: [
    DateFieldComponent,
    FormFieldComponent,
    FormsModule,
    SelectComponent,
    TextFieldComponent,
    TuiButton,
  ],
  templateUrl: './order-filters.component.html',
  styleUrl: './order-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly permissions = input.required<OrderFilterPermissions>();
  public readonly context = input<OrderFilterContext>('all');
  public readonly brands = input<CarBrand[]>([]);
  public readonly models = input<CarModel[]>([]);
  public readonly workTypes = input<WorkType[]>([]);
  public readonly statuses = input<OrderStatus[]>([]);
  public readonly workStatuses = input<WorkStatus[]>([]);
  public readonly filtersChange = output<OrderFilters>();

  protected readonly filters = signal<OrderFilters>({ ...EMPTY_FILTERS });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    });
  }

  protected has(key: keyof OrderFilterPermissions): boolean {
    return this.permissions()[key];
  }

  protected availableModels(): CarModel[] {
    const brandId = this.filters().brandId;

    return brandId
      ? this.models().filter((model) => model.brand === brandId)
      : [];
  }

  protected isAllContext(): boolean {
    return this.context() === 'all';
  }

  protected update<K extends keyof OrderFilters>(
    key: K,
    value: OrderFilters[K],
  ): void {
    this.filters.update((current) => ({ ...current, [key]: value }));
    this.emit();
  }

  protected onSearch(value: string): void {
    this.filters.update((current) => ({ ...current, search: value }));

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => this.emit(), 350);
  }

  protected onBrandChange(value: string): void {
    const brandId = Number(value);

    this.filters.update((current) => ({
      ...current,
      brandId: brandId === ALL_ID ? null : brandId,
      modelId: null,
    }));
    this.emit();
  }

  protected onModelChange(value: string): void {
    this.update('modelId', this.toNullableId(value));
  }

  protected onWorkTypeChange(value: string): void {
    this.update('workTypeId', this.toNullableId(value));
  }

  protected onStatusChange(value: string): void {
    this.update('statusId', this.toNullableId(value));
  }

  protected onWorkStatusChange(value: string): void {
    this.update('workStatusId', this.toNullableId(value));
  }

  protected brandOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все марки' },
      ...this.brands().map((brand) => ({
        value: String(brand.id),
        label: brand.name,
      })),
    ];
  }

  protected modelOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все модели' },
      ...this.availableModels().map((model) => ({
        value: String(model.id),
        label: model.name,
      })),
    ];
  }

  protected workTypeOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все типы' },
      ...this.workTypes().map((workType) => ({
        value: String(workType.id),
        label: workType.name,
      })),
    ];
  }

  protected statusOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все статусы' },
      ...this.statuses().map((status) => ({
        value: String(status.id),
        label: status.name,
      })),
    ];
  }

  protected workStatusOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все статусы' },
      ...this.workStatuses().map((status) => ({
        value: String(status.id),
        label: status.name,
      })),
    ];
  }

  protected reset(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.emit();
  }

  private toNullableId(value: string): number | null {
    const id = Number(value);

    return id === ALL_ID ? null : id;
  }

  private emit(): void {
    this.filtersChange.emit({ ...this.filters() });
  }
}
