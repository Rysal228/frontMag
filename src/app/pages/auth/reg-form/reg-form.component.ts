import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { DateFieldComponent } from 'app/shared/components/date-field/date-field.component';
import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { PasswordFieldComponent } from 'app/shared/components/password-field/password-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';

import { RegFormService } from './services/reg-form.service';

@Component({
  selector: 'app-reg-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiButton,
    FormFieldComponent,
    TextFieldComponent,
    PasswordFieldComponent,
    DateFieldComponent,
  ],
  templateUrl: './reg-form.component.html',
  styleUrl: './reg-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(RegFormService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    fullName: ['', Validators.maxLength(250)],
    birthday: [''],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { phone, password, fullName, birthday } = this.form.getRawValue();

    this.authService
      .register({
        phone,
        password,
        fullName: fullName,
        birthday: birthday,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/roles']);
        },
        error: () => {
          this.errorMessage.set('Не удалось выполнить регистрацию. Проверьте введённые данные.');
        },
      });
  }
}
