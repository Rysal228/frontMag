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
import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import {
  TuiChevron,
  TuiDataListWrapper,
  TuiInputDate,
  TuiSelect,
} from '@taiga-ui/kit';
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
    FormsModule,
    TuiButton,
    TuiChevron,
    TuiDataListWrapper,
    TuiInputDate,
    TuiSelect,
    TuiTextfield,
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

  protected onBrandChange(value: number): void {
    this.filters.update((current) => ({
      ...current,
      brandId: value === ALL_ID ? null : value,
      modelId: null,
    }));
    this.emit();
  }

  protected onModelChange(value: number): void {
    this.update('modelId', value === ALL_ID ? null : value);
  }

  protected onWorkTypeChange(value: number): void {
    this.update('workTypeId', value === ALL_ID ? null : value);
  }

  protected onStatusChange(value: number): void {
    this.update('statusId', value === ALL_ID ? null : value);
  }

  protected onWorkStatusChange(value: number): void {
    this.update('workStatusId', value === ALL_ID ? null : value);
  }

  protected onDateChange(
    key: 'dateFrom' | 'dateTo',
    value: TuiDay | null,
  ): void {
    this.update(key, value?.toString() ?? null);
  }

  protected dateValue(value: string | null): TuiDay | null {
    return value ? TuiDay.fromString(value) : null;
  }

  protected brandItems(): number[] {
    return [ALL_ID, ...this.brands().map((brand) => brand.id)];
  }

  protected modelItems(): number[] {
    return [ALL_ID, ...this.availableModels().map((model) => model.id)];
  }

  protected workTypeItems(): number[] {
    return [ALL_ID, ...this.workTypes().map((workType) => workType.id)];
  }

  protected statusItems(): number[] {
    return [ALL_ID, ...this.statuses().map((status) => status.id)];
  }

  protected workStatusItems(): number[] {
    return [ALL_ID, ...this.workStatuses().map((status) => status.id)];
  }

  protected readonly stringifyBrand = (id: number): string =>
    id === ALL_ID
      ? 'Все марки'
      : this.brands().find((brand) => brand.id === id)?.name ?? '';

  protected readonly stringifyModel = (id: number): string =>
    id === ALL_ID
      ? 'Все модели'
      : this.models().find((model) => model.id === id)?.name ?? '';

  protected readonly stringifyWorkType = (id: number): string =>
    id === ALL_ID
      ? 'Все типы'
      : this.workTypes().find((workType) => workType.id === id)?.name ?? '';

  protected readonly stringifyStatus = (id: number): string =>
    id === ALL_ID
      ? 'Все статусы'
      : this.statuses().find((status) => status.id === id)?.name ?? '';

  protected readonly stringifyWorkStatus = (id: number): string =>
    id === ALL_ID
      ? 'Все статусы'
      : this.workStatuses().find((status) => status.id === id)?.name ?? '';

  protected reset(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({ ...this.filters() });
  }
}
