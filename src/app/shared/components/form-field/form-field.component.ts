import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NgControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements AfterContentInit {
  public readonly label = input.required<string>();

  @ContentChild(NgControl)
  private control?: NgControl;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected showError = false;
  protected errorMessage = '';

  public ngAfterContentInit(): void {
    const control = this.control?.control;

    if (!control) {
      return;
    }

    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.clearServerError(control);
      this.updateError();
      this.cdr.markForCheck();
    });

    this.updateError();
  }

  private updateError(): void {
    const control = this.control?.control;
    const errors = control?.errors;

    this.showError = Boolean(errors && (control?.touched || errors['server']));

    this.errorMessage = this.getErrorMessage(errors);
  }

  private clearServerError(control: AbstractControl): void {
    if (!control.errors?.['server']) {
      return;
    }

    const { server, ...errors } = control.errors;

    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  private getErrorMessage(errors: ValidationErrors | null | undefined): string {
    if (!errors) {
      return '';
    }

    if (errors['server']) {
      return String(errors['server']);
    }

    if (errors['required']) {
      return 'Поле обязательно для заполнения';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;

      return `Минимальная длина — ${requiredLength} символов`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;

      return `Максимальная длина — ${requiredLength} символов`;
    }

    if (errors['phone']) {
      return 'Введите корректный номер телефона';
    }

    return 'Некорректное значение';
  }
}
