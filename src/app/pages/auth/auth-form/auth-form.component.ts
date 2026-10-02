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
  protected readonly codeRequested = signal(false);
  protected readonly phoneMaskitoOptions = PHONE_MASKITO_OPTIONS;

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, phoneValidator()]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    code: ['', [Validators.minLength(6), Validators.maxLength(6)]],
  });

  protected setLoginMethod(method: LoginMethod): void {
    this.loginMethod.set(method);
    this.errorMessage.set(null);
    this.codeRequested.set(false);
    this.form.controls.phone.enable();

    const password = this.form.controls.password;
    const code = this.form.controls.code;

    if (method === 'password') {
      password.setValidators([Validators.required, Validators.minLength(8)]);
      code.clearValidators();
    } else {
      password.clearValidators();
      code.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    }

    password.updateValueAndValidity();
    code.updateValueAndValidity();
  }

  protected resetCodeRequest(): void {
    this.codeRequested.set(false);
    this.errorMessage.set(null);
    this.form.controls.code.reset();
    this.form.controls.phone.enable();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.loginMethod() === 'password') {
      this.loginWithPassword();
      return;
    }

    if (!this.codeRequested()) {
      this.requestMaxCode();
      return;
    }

    this.verifyMaxCode();
  }

  private loginWithPassword(): void {
    const { phone, password } = this.form.getRawValue();

    this.authService
      .login({
        phone: normalizePhone(phone),
        password,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/roles']),
        error: (error: HttpErrorResponse) => this.handleAuthError(error),
      });
  }

  private requestMaxCode(): void {
    const { phone } = this.form.getRawValue();

    this.authService
      .requestMaxCode({
        phone: normalizePhone(phone),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.codeRequested.set(true);
          this.form.controls.phone.disable();
        },
        error: (error: HttpErrorResponse) => this.handleAuthError(error),
      });
  }

  private verifyMaxCode(): void {
    const { phone, code } = this.form.getRawValue();

    this.authService
      .verifyMaxCode({
        phone: normalizePhone(phone),
        code,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/roles']),
        error: (error: HttpErrorResponse) => this.handleAuthError(error),
      });
  }

  private handleAuthError(error: HttpErrorResponse): void {
    const formError = applyApiFormErrors(error, this.form);

    this.errorMessage.set(formError ?? 'Не удалось выполнить авторизацию. Проверьте введённые данные.');
  }
}
