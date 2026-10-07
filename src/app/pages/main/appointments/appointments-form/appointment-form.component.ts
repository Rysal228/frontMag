import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiDropdown, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiInputChip, TuiMultiSelect, TuiTextarea } from '@taiga-ui/kit';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { WorkType } from 'app/shared/models/appointment.model';
import { Car } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    DateFieldComponent,
    FormFieldComponent,
    ReactiveFormsModule,
    SelectComponent,
    TuiButton,
    TuiDataListWrapper,
    TuiDropdown,
    TuiInputChip,
    TuiMultiSelect,
    TuiTextfield,
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
  protected readonly workTypeSuggestions = signal<string[]>([]);
  protected readonly today = TuiDay.currentLocal();

  protected readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    time: new FormControl('', { nonNullable: true, validators: Validators.required }),
    car: new FormControl('', { nonNullable: true, validators: Validators.required }),
    workTypes: new FormControl<string[]>([], { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }),
  });

  protected readonly carOptions = computed<SelectOption[]>(() =>
    this.cars().map((car) => ({ value: car.id, label: `${car.brandName} ${car.modelName}` }))
  );

  protected readonly availableWorkTypeSuggestions = computed(() => {
    const selected = new Set(this.form.controls.workTypes.value.map((value) => value.casefold?.() ?? value.toLowerCase()));

    return this.workTypeSuggestions().filter((workType) => !selected.has(workType.toLowerCase()));
  });

  constructor() {
    this.workTypeSuggestions.set(this.workTypes().map((workType) => workType.name));

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
            map((availability) =>
              availability.availableSlots.map((time) => ({ value: time, label: time }))
            ),
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
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) =>
          this.appointmentService.getWorkTypes(search).pipe(
            map((workTypes) => workTypes.map((workType) => workType.name)),
            catchError(() => of([] as string[]))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((suggestions) => this.workTypeSuggestions.set(suggestions));
  }

  protected onWorkTypeInput(event: Event): void {
    this.workTypeSearch$.next((event.target as HTMLInputElement).value);
  }

  protected addCustomWorkType(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (!value) {
      return;
    }

    this.addWorkType(value);
    input.value = '';
    event.preventDefault();
  }

  private addWorkType(value: string): void {
    const normalized = value.replace(/\s+/g, ' ').trim();

    if (!normalized) {
      return;
    }

    const current = this.form.controls.workTypes.value;

    if (current.some((workType) => workType.toLowerCase() === normalized.toLowerCase())) {
      return;
    }

    this.form.controls.workTypes.setValue([...current, normalized]);
    this.form.controls.workTypes.markAsDirty();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, time, car, workTypes, description } = this.form.getRawValue();

    this.saving.set(true);
    this.hasError.set(false);

    this.appointmentService
      .create({
        car,
        workTypes,
        appointmentAt: `${date}T${time}:00`,
        description,
      })
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