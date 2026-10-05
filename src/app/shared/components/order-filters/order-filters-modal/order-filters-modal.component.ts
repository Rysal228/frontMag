import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiButton } from '@taiga-ui/core';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import {
  OrderFilterPermissions,
  OrderFilters,
  OrderStatus,
  WorkStatus,
  WorkType,
} from 'app/shared/models/appointment.model';
import { CarBrand, CarModel } from 'app/shared/models/car.model';

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
  selector: 'app-order-filters-modal',
  standalone: true,
  imports: [DateFieldComponent, FormFieldComponent, FormsModule, SelectComponent, TextFieldComponent, TuiButton],
  templateUrl: './order-filters-modal.component.html',
  styleUrl: './order-filters-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderFiltersModalComponent implements OnInit {
  public readonly permissions = input.required<OrderFilterPermissions>();
  public readonly context = input<OrderFilterContext>('all');
  public readonly filters = input.required<OrderFilters>();
  public readonly brands = input<CarBrand[]>([]);
  public readonly models = input<CarModel[]>([]);
  public readonly workTypes = input<WorkType[]>([]);
  public readonly statuses = input<OrderStatus[]>([]);
  public readonly workStatuses = input<WorkStatus[]>([]);

  public readonly closed = output<void>();
  public readonly filtersChange = output<OrderFilters>();

  protected readonly draftFilters = signal<OrderFilters>({ ...EMPTY_FILTERS });
  protected readonly allId = String(ALL_ID);

  ngOnInit(): void {
    this.draftFilters.set({ ...this.filters() });
  }

  protected has(key: keyof OrderFilterPermissions): boolean {
    return this.permissions()[key];
  }

  protected isAllContext(): boolean {
    return this.context() === 'all';
  }

  protected availableModels(): CarModel[] {
    const brandId = this.draftFilters().brandId;

    return brandId ? this.models().filter((model) => model.brand === brandId) : [];
  }

  protected selectValue(value: number | null): string {
    return String(value ?? ALL_ID);
  }

  protected onBrandChange(value: string): void {
    const brandId = Number(value);

    this.draftFilters.update((current) => ({
      ...current,
      brandId: brandId === ALL_ID ? null : brandId,
      modelId: null,
    }));
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

  protected update<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]): void {
    this.draftFilters.update((current) => ({ ...current, [key]: value }));
  }

  protected brandOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все марки' },
      ...this.brands().map((brand) => ({ value: String(brand.id), label: brand.name })),
    ];
  }

  protected modelOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все модели' },
      ...this.availableModels().map((model) => ({ value: String(model.id), label: model.name })),
    ];
  }

  protected workTypeOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все типы' },
      ...this.workTypes().map((workType) => ({ value: String(workType.id), label: workType.name })),
    ];
  }

  protected statusOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все статусы' },
      ...this.statuses().map((status) => ({ value: String(status.id), label: status.name })),
    ];
  }

  protected workStatusOptions(): SelectOption[] {
    return [
      { value: String(ALL_ID), label: 'Все статусы' },
      ...this.workStatuses().map((status) => ({ value: String(status.id), label: status.name })),
    ];
  }

  protected reset(): void {
    this.draftFilters.set({ ...EMPTY_FILTERS, search: this.filters().search });
  }

  protected apply(): void {
    this.filtersChange.emit({ ...this.draftFilters() });
    this.closed.emit();
  }

  protected close(): void {
    this.closed.emit();
  }

  private toNullableId(value: string): number | null {
    const id = Number(value);

    return id === ALL_ID ? null : id;
  }
}
