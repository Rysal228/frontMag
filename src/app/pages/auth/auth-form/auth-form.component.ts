import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TuiButton, TuiError, TuiTextfield } from '@taiga-ui/core';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [ReactiveFormsModule, TuiButton, TuiError, TuiTextfield],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isRegistration = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    fullName: [''],
    birthday: [''],
  });

  protected toggleMode(): void {
    this.isRegistration.update((value) => !value);
    this.errorMessage.set(null);

    this.form.reset();

    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);

    if (this.isRegistration()) {
      this.form.controls.fullName.setValidators([Validators.maxLength(250)]);
    } else {
      this.form.controls.fullName.clearValidators();
    }

    this.form.controls.fullName.updateValueAndValidity();
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { phone, password, fullName, birthday } = this.form.getRawValue();

      if (this.isRegistration()) {
        await this.authService.register({
          phone,
          password,
          fullName: fullName,
          birthday: birthday,
        });
      } else {
        await this.authService.login({
          phone,
          password,
        });
      }

      await this.router.navigate(['/roles']);
    } catch (error) {
      console.error(error);

      this.errorMessage.set('Не удалось выполнить операцию. Проверьте введённые данные.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
