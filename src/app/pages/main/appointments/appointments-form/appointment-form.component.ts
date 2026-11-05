import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, finalize, map, of, startWith, switchMap, tap, timer } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiOption, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiDropdownOpen } from '@taiga-ui/core/directives/dropdown';
import { TuiInputChip, TuiMultiSelect, TuiTextarea } from '@taiga-ui/kit';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { WorkType } from 'app/shared/models/appointment.model';
import { Car } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { createAppointmentPayload } from 'app/shared/utils/appointment-payload.util';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    DateFieldComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    SelectComponent,
    TuiButton,
    TuiDataList,
    TuiInputChip,
    TuiMultiSelect,
    TuiOption,
    TuiTextfield,
    TuiTextfieldDropdownDirective,
    TuiTextarea,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent {
  @ViewChild('workTypeField', { read: TuiDropdownOpen })
  private workTypeDropdown?: TuiDropdownOpen;

  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly workTypeSearch$ = new Subject<string>();
  private readonly workTypesById = new Map<string, WorkType>();
  private lastAvailabilityDate: string | null = null;

  public readonly cars = input<readonly Car[]>([]);
  public readonly workTypes = input<readonly WorkType[]>([]);
  public readonly closed = output<void>();
  public readonly created = output<void>();

  protected readonly saving = signal(false);
  protected readonly isLoadingSlots = signal(false);
  protected readonly hasError = signal(false);
  protected readonly hasAvailabilityError = signal(false);
  protected readonly timeBecameUnavailable = signal(false);
  protected readonly timeOptions = signal<SelectOption[]>([]);
  protected readonly dayType = signal<'working' | 'nonWorking' | null>(null);
  protected readonly plannedDuration = signal<number | null>(null);
  protected readonly today = TuiDay.currentLocal();

  protected readonly selectedWorksControl = new FormControl<WorkType[]>([], { nonNullable: true });
  protected readonly selectedWorks = signal<WorkType[]>([]);
  protected readonly workTypeSuggestions = signal<WorkType[]>([]);
  protected readonly stringifyWorkType = (value: unknown): string => (this.isWorkType(value) ? value.name : '');
  protected readonly disabledWorkType = (value: unknown): boolean => !this.isKnownWorkType(value);

  protected readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    time: new FormControl('', { nonNullable: true, validators: Validators.required }),
    car: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }),
  });

  protected readonly carOptions = computed<SelectOption[]>(() =>
    this.cars().map((car) => ({ value: car.id, label: `${car.brandName} ${car.modelName}` }))
  );

  protected readonly availableWorkTypes = computed(() => {
    const selectedIds = new Set(this.selectedWorks().map(({ id }) => id));
    return this.workTypeSuggestions().filter(({ id }) => !selectedIds.has(id));
  });

  constructor() {
    effect(() => {
      const items = this.workTypes();
      for (const work of items) {
        this.workTypesById.set(work.id, work);
      }
      this.workTypeSuggestions.set([...items]);
    });

    combineLatest([
      this.form.controls.date.valueChanges.pipe(startWith(this.form.controls.date.value), distinctUntilChanged()),
      this.selectedWorksControl.valueChanges.pipe(startWith(this.selectedWorksControl.value)),
    ])
      .pipe(
        tap(([date]) => {
          // Изменение даты сбрасывает время, но изменение работ — нет.
          // При смене работ сохраняем выбранный слот до ответа сервера.
          if (date !== this.lastAvailabilityDate) {
            this.form.controls.time.setValue('', { emitEvent: false });
            this.timeOptions.set([]);
          }
          this.lastAvailabilityDate = date;
          this.dayType.set(null);
          this.plannedDuration.set(null);
          this.hasAvailabilityError.set(false);
          this.timeBecameUnavailable.set(false);
        }),
        switchMap(([date, works]) => {
          if (!date) {
            return of([] as SelectOption[]);
          }

          this.isLoadingSlots.set(true);
          const workIds = [...new Set(works.filter((work) => this.workTypesById.has(work.id)).map((work) => work.id))];

          // switchMap отменяет устаревший запрос сразу при изменении работ.
          // Небольшая задержка перед новым GET не оставляет окно для старого ответа.
          return timer(100).pipe(
            switchMap(() => this.appointmentService.getAvailability(date, workIds)),
            tap((availability) => {
              this.dayType.set(availability.dayType);
              this.plannedDuration.set(availability.plannedDuration);
            }),
            map((availability) => availability.availableSlots.map((time) => ({ value: time, label: time }))),
            catchError(() => {
              this.hasAvailabilityError.set(true);
              // Не затираем время/варианты при временной ошибке проверки.
              // Отправка формы заблокирована, пока ответ не получен.
              return of(null);
            }),
            finalize(() => this.isLoadingSlots.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((options) => {
        if (options === null) return;
        this.timeOptions.set(options);
        const selectedTime = this.form.controls.time.value;
        if (selectedTime && !options.some(({ value }) => value === selectedTime)) {
          this.form.controls.time.setValue('', { emitEvent: false });
          this.timeBecameUnavailable.set(true);
        }
      });

    this.workTypeSearch$
      .pipe(
        map((search) => search.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((search) =>
          this.appointmentService.getWorkTypes(search).pipe(catchError(() => of([] as WorkType[])))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((items) => {
        for (const work of items) {
          this.workTypesById.set(work.id, work);
        }
        this.workTypeSuggestions.set(items);
      });

    this.selectedWorksControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selected) => {
      const safeItems: WorkType[] = [];

      for (const candidate of selected as unknown[]) {
        if (!this.isWorkType(candidate)) {
          continue;
        }
        const known = this.workTypesById.get(candidate.id);
        if (known && !safeItems.some(({ id }) => id === known.id)) {
          safeItems.push(known);
        }
      }
      if (safeItems.length !== selected.length || safeItems.some((item, index) => item !== selected[index])) {
        this.selectedWorksControl.setValue(safeItems, { emitEvent: false });
      }
      this.selectedWorks.set(safeItems);
    });

    this.form.controls.time.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((time) => {
      if (time) this.timeBecameUnavailable.set(false);
    });
  }

  protected onWorkTypeInput(event: Event): void {
    this.workTypeSearch$.next((event.target as HTMLInputElement).value);
  }

  protected onWorkTypeFocus(): void {
    this.workTypeSuggestions.set([...this.workTypesById.values()]);
    this.workTypeSearch$.next('');
    this.openWorkTypeDropdown();
  }

  protected onWorkTypeClick(): void {
    this.openWorkTypeDropdown();
  }

  private openWorkTypeDropdown(): void {
    if (this.availableWorkTypes().length) {
      this.workTypeDropdown?.toggle(true);
    }
  }

  protected onWorkTypeEnter(event: Event): void {
    event.preventDefault();
  }

  private isWorkType(value: unknown): value is WorkType {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as WorkType).id === 'string' &&
      typeof (value as WorkType).name === 'string'
    );
  }

  private isKnownWorkType(value: unknown): boolean {
    return this.isWorkType(value) && this.workTypesById.has(value.id);
  }

  protected formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (!hours) return `${remainder} мин`;
    return remainder ? `${hours} ч ${remainder} мин` : `${hours} ч`;
  }

  protected save(): void {
    if (this.form.invalid || this.saving() || this.isLoadingSlots() || this.hasAvailabilityError()) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, time, car, description } = this.form.getRawValue();
    this.saving.set(true);
    this.hasError.set(false);

    this.appointmentService
      .create(
        createAppointmentPayload(
          car,
          date,
          time,
          this.selectedWorks().map(({ id }) => id),
          description
        )
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.created.emit();
        },
        error: () => {
          this.saving.set(false);
          this.hasError.set(true);
        },
      });
  }
}
