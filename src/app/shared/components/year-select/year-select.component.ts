import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-year-select',
  standalone: true,
  templateUrl: './year-select.component.html',
  styleUrl: './year-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearSelectComponent),
      multi: true,
    },
  ],
})
export class YearSelectComponent implements ControlValueAccessor {
  public readonly minYear = input(1900);
  public readonly maxYear = input(new Date().getFullYear() + 1);
  public readonly placeholder = input('Выберите год выпуска');

  protected readonly years = computed(() => {
    const years: number[] = [];

    for (let year = this.maxYear(); year >= this.minYear(); year--) {
      years.push(year);
    }

    return years;
  });

  protected value = '';
  protected disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: string | number | null): void {
    this.value = value == null ? '' : String(value);
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onValueChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.value = select.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
