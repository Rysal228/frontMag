import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton, TuiFilterByInputPipe, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiInputChip, TuiMultiSelect } from '@taiga-ui/kit';

import { Appointment } from 'app/shared/models/appointment.model';
import { Mechanic } from 'app/shared/models/user.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [RouterLink, TuiButton, TuiIcon, DatePipe, ReactiveFormsModule, TuiTextfield, TuiMultiSelect, TuiDataListWrapper, TuiInputChip, TuiFilterByInputPipe],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentService = inject(AppointmentService);
  private readonly userService = inject(UserService);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly mechanics = signal<Mechanic[]>([]);
  protected readonly isSavingMechanics = signal(false);
  protected readonly mechanicsControl = new FormControl<Mechanic[]>([], { nonNullable: true });
  protected readonly stringifyMechanic = (mechanic: Mechanic): string =>
    `${mechanic.lastName} ${mechanic.firstName} ${mechanic.patronymic}`.trim();

  constructor() {
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
              this.userService.getMechanics().subscribe({
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

  protected saveMechanics(): void {
    const appointment = this.appointment();
    if (!appointment || !appointment.permissions.canAssignMechanics || this.mechanicsControl.pristine) {
      return;
    }

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
