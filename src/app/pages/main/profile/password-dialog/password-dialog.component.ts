import { ChangeDetectionStrategy, Component, HostListener, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { TuiAutoFocus, TuiFocusTrap } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';

import { FormFieldComponent } from 'app/shared/components/form-field/form-field.component';
import { TextFieldComponent } from 'app/shared/components/text-field/text-field.component';
import { PasswordService } from 'app/shared/services/password.service';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule, TextFieldComponent, TuiButton, TuiAutoFocus, TuiFocusTrap],
  templateUrl: './password-dialog.component.html',
  styleUrl: './password-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
  private readonly passwordService = inject(PasswordService);

  public readonly closed = output<void>();

  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly hasPassword = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.loadPasswordStatus();
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected onEscape(event: KeyboardEvent): void {
    event.preventDefault();
    this.close();
  }

  private loadPasswordStatus(): void {
    this.passwordService
      .getStatus()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ hasPassword }) => {
          this.hasPassword.set(hasPassword);

          if (!hasPassword) {
            this.form.controls.currentPassword.clearValidators();
            this.form.controls.currentPassword.updateValueAndValidity();
          } else {
            this.form.controls.currentPassword.setValidators([Validators.required]);
            this.form.controls.currentPassword.updateValueAndValidity();
          }
        },
        error: () => {
          this.error.set('Не удалось получить состояние пароля.');
        },
      });
  }

  protected save(): void {
    if (this.isLoading() || this.isSaving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ server: 'Пароли не совпадают' });
      return;
    }

    if (this.hasPassword() && newPassword === currentPassword) {
      this.form.controls.newPassword.setErrors({ server: 'Новый пароль должен отличаться от текущего' });
      return;
    }

    this.error.set(null);
    this.isSaving.set(true);

    this.passwordService
      .save({
        ...(this.hasPassword() ? { currentPassword } : {}),
        newPassword,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.close(),
        error: () => this.error.set('Не удалось сохранить пароль. Проверьте введённые данные.'),
      });
  }

  protected close(): void {
    this.closed.emit();
  }
}
