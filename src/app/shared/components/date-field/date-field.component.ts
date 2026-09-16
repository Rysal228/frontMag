import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiCalendar, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDate } from '@taiga-ui/kit';

@Component({
  selector: 'app-date-field',
  standalone: true,
  imports: [TuiCalendar, TuiInputDate, TuiTextfield, FormsModule],
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
  ],
})
export class DateFieldComponent implements ControlValueAccessor {
  protected value: TuiDay | null = null;
  protected disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: string | null): void {
    this.value = value ? TuiDay.fromLocalNativeDate(new Date(`${value}T00:00:00`)) : null;
  }

  public registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected onValueChange(value: TuiDay | null): void {
    this.value = value;

    if (!value) {
      this.onChange(null);
    } else {
      const month = String(value.month).padStart(2, '0');
      const day = String(value.day).padStart(2, '0');

      this.onChange(`${value.year}-${month}-${day}`);
    }

    this.onTouched();
  }
}
