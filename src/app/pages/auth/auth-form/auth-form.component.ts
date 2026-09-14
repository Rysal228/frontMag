import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { TuiButton } from '@taiga-ui/core';

import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { PasswordFieldComponent } from 'app/shared/components/password-field/password-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { PHONE_MASKITO_OPTIONS } from 'app/shared/masks/phone-maskito';
import { applyApiFormErrors } from 'app/shared/utils/api-form-errors.util';
import { normalizePhone } from 'app/shared/utils/phone-normalize.util';
import { phoneValidator } from 'app/shared/validators/phone.validator';

import { AuthFormService } from './services/auth-form.service';

type LoginMethod = 'password' | 'code';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [ReactiveFormsModule, TuiButton, FormFieldComponent, TextFieldComponent, PasswordFieldComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthFormService);
  private readonly router = inject(Router);

  protected readonly loginMethod = signal<LoginMethod>('password');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly phoneMaskitoOptions = PHONE_MASKITO_OPTIONS;

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, phoneValidator()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    code: [''],
  });

  protected setLoginMethod(method: LoginMethod): void {
    this.loginMethod.set(method);
    this.errorMessage.set(null);

    const password = this.form.controls.password;
    const code = this.form.controls.code;

    if (method === 'password') {
      password.setValidators([Validators.required, Validators.minLength(8)]);

      code.clearValidators();
    } else {
      password.clearValidators();

      code.setValidators([Validators.required]);
    }

    password.updateValueAndValidity();
    code.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.loginMethod() === 'code') {
      this.errorMessage.set('Авторизация по коду пока недоступна.');

      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { phone, password } = this.form.getRawValue();

    this.authService
      .login({
        phone: normalizePhone(phone),
        password,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          return this.router.navigate(['/roles']);
        },
        error: (error: HttpErrorResponse) => {
          const formError = applyApiFormErrors(error, this.form);

          this.errorMessage.set(formError ?? 'Не удалось выполнить авторизацию. Проверьте номер телефона и пароль.');
        },
      });
  }
}
