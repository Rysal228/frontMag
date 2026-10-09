import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiInputChip, TuiMultiSelect } from '@taiga-ui/kit';

import { Appointment } from 'app/shared/models/appointment.model';
import { Mechanic } from 'app/shared/models/user.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [RouterLink, TuiButton, TuiIcon, DatePipe, ReactiveFormsModule, TuiTextfield, TuiMultiSelect, TuiDataListWrapper, TuiInputChip],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mechanicSearch$ = new Subject<string>();
  private readonly appointmentService = inject(AppointmentService);
  private readonly userService = inject(UserService);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly mechanics = signal<Mechanic[]>([]);
  protected readonly isSavingMechanics = signal(false);
  protected readonly mechanicsControl = new FormControl<Mechanic[]>([], { nonNullable: true });
  protected readonly stringifyMechanic = (value: Mechanic | string): string => {
    if (typeof value === 'string') {
      return value;
    }

    return `${value.lastName} ${value.firstName} ${value.patronymic}`.trim();
  };

  constructor() {
    this.mechanicSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search) => {
          const selectedIds = this.mechanicsControl.getRawValue().map(({ id }) => id);
          if (search.trim().length < 2) {
            return this.userService.getMechanics('', selectedIds);
          }

          return this.userService.getMechanics(search, selectedIds);
        }),
        tap((mechanics) => this.mechanics.set(mechanics)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.appointment.set(null);
      this.hasError.set(!id);
      this.isLoading.set(!!id);

      if (!id) {
        return;
      }

      this.appointmentService
        .getById(id)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (appointment) => {
            this.appointment.set(appointment);
            if (appointment.permissions.canAssignMechanics) {
              this.userService.getMechanics('', appointment.mechanics).subscribe({
                next: (mechanics) => {
                  this.mechanics.set(mechanics);
                  this.mechanicsControl.setValue(
                    mechanics.filter(({ id }) => appointment.mechanics.includes(id)),
                    { emitEvent: false },
                  );
                  this.mechanicsControl.markAsPristine();
                },
              });
            } else {
              this.mechanicsControl.setValue([], { emitEvent: false });
              this.mechanicsControl.markAsPristine();
            }
          },
          error: () => this.hasError.set(true),
        });
    });
  }

  protected searchMechanics(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.mechanicSearch$.next(value);
  }

  protected cleanMechanicSelection(): void {
    const value = this.mechanicsControl.getRawValue() as unknown[];
    const selectedMechanics = value.filter(
      (item): item is Mechanic => typeof item === 'object' && item !== null && 'id' in item,
    );

    if (selectedMechanics.length !== value.length) {
      this.mechanicsControl.setValue(selectedMechanics);
    }
  }

  protected saveMechanics(): void {
    const appointment = this.appointment();
    if (!appointment || !appointment.permissions.canAssignMechanics || this.mechanicsControl.pristine) {
      return;
    }

    this.cleanMechanicSelection();
    this.isSavingMechanics.set(true);
    this.appointmentService.updateMechanics(
      appointment.id,
      this.mechanicsControl.getRawValue().map(({ id }) => id),
    ).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.mechanicsControl.markAsPristine();
        this.isSavingMechanics.set(false);
      },
      error: () => this.isSavingMechanics.set(false),
    });
  }
}
