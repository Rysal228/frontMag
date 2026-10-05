import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiButton } from '@taiga-ui/core';
import { TuiBadgeNotification, TuiBadgedContent } from '@taiga-ui/kit';

import {
  OrderFiltersModalComponent,
  OrderFilterContext,
} from 'app/shared/components/order-filters/order-filters-modal/order-filters-modal.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import {
  OrderFilterPermissions,
  OrderFilters,
  OrderStatus,
  WorkStatus,
  WorkType,
} from 'app/shared/models/appointment.model';
import { CarBrand, CarModel } from 'app/shared/models/car.model';

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
  imports: [
    FormFieldComponent,
    FormsModule,
    OrderFiltersModalComponent,
    TuiBadgeNotification,
    TuiBadgedContent,
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
  protected readonly isModalOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    });
  }

  protected hasSearch(): boolean {
    return this.permissions().search;
  }

  protected openModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected onModalFiltersChange(filters: OrderFilters): void {
    this.filters.set(filters);
    this.filtersChange.emit({ ...filters });
  }

  protected onSearch(value: string): void {
    this.filters.update((current) => ({ ...current, search: value }));

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => this.emit(), 350);
  }

  protected resetAll(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.emit();
  }

  protected activeFilterCount(): number {
    const filters = this.filters();

    return [
      filters.orderNumber,
      filters.vin,
      filters.plateNumber,
      filters.brandId,
      filters.modelId,
      filters.workTypeId,
      filters.statusId,
      filters.workStatusId,
      filters.dateFrom,
      filters.dateTo,
    ].filter((value) => value !== null && value !== '').length;
  }

  private emit(): void {
    this.filtersChange.emit({ ...this.filters() });
  }
}
