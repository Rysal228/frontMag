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
import { NgControl } from '@angular/forms';
import { takeUntil } from 'rxjs';

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

    control.statusChanges.pipe(takeUntil(this.destroyRef)).subscribe(() => {
      this.updateError();
      this.cdr.markForCheck();
    });

    this.updateError();
  }

  private updateError(): void {
    const control = this.control?.control;

    this.showError = Boolean(control?.invalid && control.touched);
    this.errorMessage = this.getErrorMessage(control?.errors);
  }

  private getErrorMessage(errors: Record<string, unknown> | null | undefined): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Поле обязательно для заполнения';
    }

    if (errors['minlength']) {
      return 'Значение слишком короткое';
    }

    if (errors['maxlength']) {
      return 'Значение слишком длинное';
    }

    return 'Некорректное значение';
  }
}
