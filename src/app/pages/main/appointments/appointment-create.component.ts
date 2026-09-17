import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { SelectComponent, SelectOption } from 'app/shared/components/select/select.component';
import { WorkType } from 'app/shared/models/appointment.model';
import { Car } from 'app/shared/models/car.model';
import { AppointmentService } from 'app/shared/services/appointment.service';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [DateFieldComponent, FormFieldComponent, ReactiveFormsModule, SelectComponent, TuiButton, TuiTextfield, TuiTextarea],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentCreateComponent {
  private readonly appointmentService = inject(AppointmentService);

  public readonly cars = input<readonly Car[]>([]);
  public readonly workTypes = input<readonly WorkType[]>([]);
  public readonly closed = output<void>();
  public readonly created = output<void>();

  protected readonly saving = signal(false);
  protected readonly hasError = signal(false);

  protected readonly form = new FormGroup({
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    time: new FormControl('', { nonNullable: true, validators: Validators.required }),
    car: new FormControl('', { nonNullable: true, validators: Validators.required }),
    workType: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }),
  });

  protected readonly carOptions = computed<SelectOption[]>(() =>
    this.cars().map((car) => ({ value: car.id, label: `${car.brandName} ${car.modelName}` })),
  );

  protected readonly workTypeOptions = computed<SelectOption[]>(() =>
    this.workTypes().map((workType) => ({ value: String(workType.id), label: workType.name })),
  );

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { date, time, car, workType, description } = this.form.getRawValue();

    this.saving.set(true);
    this.hasError.set(false);

    this.appointmentService
      .create({
        car,
        workType: Number(workType),
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
