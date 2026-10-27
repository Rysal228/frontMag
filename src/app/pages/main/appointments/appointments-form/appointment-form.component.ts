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
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiOption, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
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
  private readonly appointmentService = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly workTypeSearch$ = new Subject<string>();
  private readonly workTypesById = new Map<string, WorkType>();

  public readonly cars = input<readonly Car[]>([]);
  public readonly workTypes = input<readonly WorkType[]>([]);
  public readonly closed = output<void>();
  public readonly created = output<void>();

  protected readonly saving = signal(false);
  protected readonly isLoadingSlots = signal(false);
  protected readonly hasError = signal(false);
  protected readonly hasAvailabilityError = signal(false);
  protected readonly timeOptions = signal<SelectOption[]>([]);
  protected readonly dayType = signal<'working' | 'nonWorking' | null>(null);
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

    this.form.controls.date.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          this.form.controls.time.setValue('', { emitEvent: false });
          this.timeOptions.set([]);
          this.dayType.set(null);
          this.hasAvailabilityError.set(false);
        }),
        switchMap((date) => {
          if (!date) {
            return of([] as SelectOption[]);
          }

          this.isLoadingSlots.set(true);

          return this.appointmentService.getAvailability(date).pipe(
            tap((availability) => this.dayType.set(availability.dayType)),
            map((availability) => availability.availableSlots.map((time) => ({ value: time, label: time }))),
            catchError(() => {
              this.hasAvailabilityError.set(true);
              return of([] as SelectOption[]);
            }),
            finalize(() => this.isLoadingSlots.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((options) => this.timeOptions.set(options));

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
  }

  protected onWorkTypeInput(event: Event): void {
    this.workTypeSearch$.next((event.target as HTMLInputElement).value);
  }

  protected onWorkTypeFocus(): void {
    this.workTypeSuggestions.set([...this.workTypesById.values()]);
    this.workTypeSearch$.next('');
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

  protected save(): void {
    if (this.form.invalid || this.saving()) {
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
