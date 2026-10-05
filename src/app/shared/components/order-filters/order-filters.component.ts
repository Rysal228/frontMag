import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
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

@Component({
  selector: 'app-order-filters',
  standalone: true,
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
    return brandId ? this.models().filter((model) => model.brand === brandId) : [];
  }

  protected isAllContext(): boolean {
    return this.context() === 'all';
  }

  protected update<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]): void {
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
    const brandId = value ? Number(value) : null;

    this.filters.update((current) => ({
      ...current,
      brandId,
      modelId: null,
    }));
    this.emit();
  }

  protected reset(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({ ...this.filters() });
  }
}
