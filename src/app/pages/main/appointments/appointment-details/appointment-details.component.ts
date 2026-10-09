import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, switchMap, tap } from 'rxjs';

import {
  TuiButton,
  TuiDataList,
  TuiIcon,
  TuiOption,
  TuiTextfield,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import { TuiInputChip, TuiMultiSelect } from '@taiga-ui/kit';

import { Appointment } from 'app/shared/models/appointment.model';
import { Mechanic } from 'app/shared/models/user.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    RouterLink,
    TuiButton,
    TuiDataList,
    TuiTextfieldDropdownDirective,
    TuiIcon,
    TuiInputChip,
    TuiMultiSelect,
    TuiOption,
    DatePipe,
    ReactiveFormsModule,
    TuiTextfield,
  ],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mechanicSearch$ = new Subject<{ search: string; selectedIds: string[] }>();
  private mechanicSearchText = '';
  private readonly appointmentService = inject(AppointmentService);
  private readonly userService = inject(UserService);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly mechanics = signal<Mechanic[]>([]);
  protected readonly isSavingMechanics = signal(false);
  protected readonly mechanicsControl = new FormControl<Mechanic[]>([], { nonNullable: true });
  protected readonly stringifyMechanic = (item: unknown): string => {
    if (!this.isMechanic(item)) {
      return typeof item === 'string' ? item : '';
    }

    return [item.lastName, item.firstName, item.patronymic].filter(Boolean).join(' ');
  };
  protected readonly disabledMechanic = (item: unknown): boolean => !this.isMechanic(item);

  constructor() {
    this.mechanicSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.search === current.search &&
            previous.selectedIds.length === current.selectedIds.length &&
            previous.selectedIds.every((id, index) => id === current.selectedIds[index])
        ),
        switchMap(({ search, selectedIds }) =>
          this.userService.getMechanics(search.trim().length < 2 ? '' : search.trim(), selectedIds)
        ),
        tap((mechanics) => this.mechanics.set(mechanics)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.mechanicsControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.queueMechanicSearch());

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
                    { emitEvent: false }
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

  protected availableMechanics(): Mechanic[] {
    const selectedIds = new Set(
      this.mechanicsControl
        .getRawValue()
        .filter((item): item is Mechanic => this.isMechanic(item))
        .map(({ id }) => id)
    );

    return this.mechanics().filter(({ id }) => !selectedIds.has(id));
  }

  protected searchMechanics(event: Event): void {
    this.queueMechanicSearch((event.target as HTMLInputElement).value);
  }

  private queueMechanicSearch(search = this.mechanicSearchText): void {
    this.mechanicSearchText = search;
    const selectedIds = this.mechanicsControl
      .getRawValue()
      .filter((item): item is Mechanic => this.isMechanic(item))
      .map(({ id }) => id);

    this.mechanicSearch$.next({ search, selectedIds });
  }

  private isMechanic(item: unknown): item is Mechanic {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    const mechanic = item as Partial<Mechanic>;

    return (
      typeof mechanic.id === 'string' &&
      typeof mechanic.firstName === 'string' &&
      typeof mechanic.lastName === 'string' &&
      typeof mechanic.patronymic === 'string'
    );
  }

  protected saveMechanics(): void {
    const appointment = this.appointment();
    if (!appointment || !appointment.permissions.canAssignMechanics || this.mechanicsControl.pristine) {
      return;
    }

    this.isSavingMechanics.set(true);
    this.appointmentService
      .updateMechanics(
        appointment.id,
        this.mechanicsControl
          .getRawValue()
          .filter((item): item is Mechanic => this.isMechanic(item))
          .map(({ id }) => id)
      )
      .subscribe({
        next: (updated) => {
          this.appointment.set(updated);
          this.mechanicsControl.markAsPristine();
          this.isSavingMechanics.set(false);
        },
        error: () => this.isSavingMechanics.set(false),
      });
  }
}
