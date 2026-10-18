import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { TuiButton, TuiDialogContext, TuiTextfield } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { PasswordService } from 'app/shared/services/password.service';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    TextFieldComponent,
    TuiButton,
    TuiTextfield,
  ],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
  private readonly passwordService = inject(PasswordService);
  private readonly context = injectContext<TuiDialogContext<void>>();

  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  // Null means the 1C password state was not loaded; it must not be treated
  // as permission to create a password without verifying the old credential.
  protected readonly hasPassword = signal<boolean | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    currentPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(128)],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.loadPasswordStatus();
  }

  private loadPasswordStatus(): void {
    this.passwordService
      .getStatus()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ hasPassword }) => {
          if (typeof hasPassword !== 'boolean') {
            this.error.set('1С вернула некорректное состояние пароля.');
            return;
          }
          this.hasPassword.set(hasPassword);
        },
        error: () => {
          this.error.set('Не удалось получить состояние пароля из 1С.');
        },
      });
  }

  protected save(): void {
    if (this.isLoading() || this.isSaving() || this.hasPassword() !== true || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ server: 'Пароли не совпадают' });
      return;
    }

    if (newPassword === currentPassword) {
      this.form.controls.newPassword.setErrors({ server: 'Новый пароль должен отличаться от текущего' });
      return;
    }

    this.error.set(null);
    this.isSaving.set(true);

    this.passwordService
      .save({ currentPassword, newPassword })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.context.completeWith(),
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 400) {
            const currentMessage = err.error?.currentPassword;
            const newMessage = err.error?.newPassword;
            if (currentMessage) {
              this.form.controls.currentPassword.setErrors({
                server: Array.isArray(currentMessage) ? currentMessage[0] : currentMessage,
              });
              return;
            }
            if (newMessage) {
              this.form.controls.newPassword.setErrors({
                server: Array.isArray(newMessage) ? newMessage[0] : newMessage,
              });
              return;
            }
          }
          this.error.set('Не удалось изменить пароль. Проверьте введённые данные.');
        },
      });
  }

  protected close(): void {
    this.context.$implicit.complete();
  }
}
