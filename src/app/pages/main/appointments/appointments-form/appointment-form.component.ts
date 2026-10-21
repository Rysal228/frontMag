import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

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
  private readonly workInput = viewChild<ElementRef<HTMLInputElement>>('workInput');

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

  // The query is free text; only actual 1C catalog items can become chips.
  protected readonly workQuery = new FormControl('', { nonNullable: true });
  protected readonly workMenuOpen = signal(false);
  protected readonly workSearchLoading = signal(false);
  protected readonly workSearchFailed = signal(false);
  protected readonly workSuggestions = signal<readonly WorkType[]>([]);
  protected readonly selectedWorks = signal<WorkType[]>([]);

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
    const query = this.workQuery.value.trim().toLocaleLowerCase('ru-RU');

    return this.workSuggestions()
      .filter(({ id, name }) =>
        !selectedIds.has(id) && (!query || name.toLocaleLowerCase('ru-RU').includes(query))
      );
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

    this.workTypeSearch$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.workSearchLoading.set(true);
          this.workSearchFailed.set(false);
        }),
        switchMap((search) =>
          this.appointmentService.getWorkTypes(search).pipe(
            catchError(() => {
              this.workSearchFailed.set(true);
              return of([] as WorkType[]);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((works) => {
        this.workSuggestions.set(works);
        this.workSearchLoading.set(false);
      });

    this.workQuery.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        this.workMenuOpen.set(true);
        // While a filtered HTTP result is loading, never show mismatching chips.
        this.workSuggestions.set(this.workTypes());
        this.workTypeSearch$.next(search.trim());
      });
  }

  protected focusWorkInput(): void {
    this.workInput()?.nativeElement.focus();
  }

  protected openWorkMenu(): void {
    this.workMenuOpen.set(true);
    this.workSuggestions.set(this.workTypes());
    this.workTypeSearch$.next(this.workQuery.value.trim());
  }

  protected closeWorkMenu(event: FocusEvent): void {
    const next = event.relatedTarget;
    const container = event.currentTarget;
    if (next instanceof Node && container instanceof Node && container.contains(next)) {
      return;
    }
    this.workMenuOpen.set(false);
  }

  protected onWorkKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.workMenuOpen.set(false);
    }
    if (event.key === 'Enter' || event.key === ',') {
      // A typed name must never be submitted or converted into a custom chip.
      event.preventDefault();
      if (event.key === 'Enter' && this.availableWorkTypes().length === 1) {
        this.selectWorkType(this.availableWorkTypes()[0]);
      }
    }
  }

  protected selectWorkType(work: WorkType): void {
    const available = this.availableWorkTypes();
    // Reject fabricated/stale values: they must come from current 1C results.
    if (!available.some(({ id }) => id === work.id)) {
      return;
    }
    this.selectedWorks.update((items) =>
      items.some(({ id }) => id === work.id) ? items : [...items, work]
    );
    this.workQuery.setValue('', { emitEvent: false });
    this.workMenuOpen.set(true);
    this.workSuggestions.set(this.workTypes());
    this.workTypeSearch$.next('');
    this.focusWorkInput();
  }

  protected removeWorkType(id: string): void {
    this.selectedWorks.update((items) => items.filter((work) => work.id !== id));
    this.workMenuOpen.set(true);
    this.workSuggestions.set(this.workTypes());
    this.workTypeSearch$.next(this.workQuery.value.trim());
    this.focusWorkInput();
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
      .create(createAppointmentPayload(
        car, date, time, this.selectedWorks().map(({ id }) => id), description
      ))
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
