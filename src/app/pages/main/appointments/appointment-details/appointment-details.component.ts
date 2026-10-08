import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiIcon } from '@taiga-ui/core';

import { Appointment } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [RouterLink, TuiIcon, DatePipe],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentService = inject(AppointmentService);

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

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
          next: (appointment) => this.appointment.set(appointment),
          error: () => this.hasError.set(true),
        });
    });
  }
}
