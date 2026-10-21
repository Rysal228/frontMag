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
import { catchError, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

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
  protected readonly selectedWorkTypeIds = signal<string[]>([]);
  protected readonly today = TuiDay.currentLocal();

  protected readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    time: new FormControl('', { nonNullable: true, validators: Validators.required }),
    car: new FormControl('', { nonNullable: true, validators: Validators.required }),
    workTypeToAdd: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }),
  });

  protected readonly carOptions = computed<SelectOption[]>(() =>
    this.cars().map((car) => ({ value: car.id, label: `${car.brandName} ${car.modelName}` }))
  );

  // Only items returned from the 1C ВидыРабот catalog can be selected.
  protected readonly availableWorkTypeOptions = computed<SelectOption[]>(() => {
    const selected = new Set(this.selectedWorkTypeIds());
    return this.workTypes()
      .filter(({ id }) => !selected.has(id))
      .map(({ id, name }) => ({ value: id, label: name }));
  });

  protected readonly selectedWorks = computed(() => {
    const types = new Map(this.workTypes().map((work) => [work.id, work.name]));
    return this.selectedWorkTypeIds().map((id) => ({
      id,
      name: types.get(id) ?? id,
    }));
  });

  constructor() {
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
  }

  protected addWorkType(): void {
    const id = this.form.controls.workTypeToAdd.value;
    if (!id || !this.workTypes().some((work) => work.id === id)) {
      return;
    }

    this.selectedWorkTypeIds.update((current) =>
      current.includes(id) ? current : [...current, id]
    );
    this.form.controls.workTypeToAdd.setValue('');
  }

  protected removeWorkType(id: string): void {
    this.selectedWorkTypeIds.update((current) => current.filter((item) => item !== id));
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, time, car, description } = this.form.getRawValue();
    const ids = this.selectedWorkTypeIds();

    // Never forward free-text work names even if the browser modifies form state.
    if (!ids.every((id) => this.workTypes().some((work) => work.id === id))) {
      this.hasError.set(true);
      return;
    }

    this.saving.set(true);
    this.hasError.set(false);

    this.appointmentService
      .create({
        car,
        works: ids.map((workTypeId) => ({ workTypeId })),
        // Workshop time zone is Asia/Krasnoyarsk, matching the 1C API contract.
        appointmentAt: `${date}T${time}:00+07:00`,
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
