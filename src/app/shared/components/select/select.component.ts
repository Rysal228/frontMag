import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  public readonly options = input<readonly SelectOption[]>([]);
  public readonly placeholder = input('');
  public readonly disabled = input(false);

  protected value = '';
  protected controlDisabled = false;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  public writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.controlDisabled = isDisabled;
  }

  protected onValueChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.value = select.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
