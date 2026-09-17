import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

import { TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';

export type SelectOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule, TuiChevron, TuiDataListWrapper, TuiSelect, TuiTextfield],
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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly selectControl = new FormControl<string | null>(null);

  public readonly options = input<readonly SelectOption[]>([]);
  public readonly placeholder = input('');
  public readonly disabled = input(false);

  protected readonly optionValues = computed(() => this.options().map((option) => option.value));
  protected readonly controlDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  protected readonly stringify = (value: string): string =>
    this.options().find((option) => option.value === value)?.label ?? '';

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    this.selectControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.onChange(value ?? '');
    });

    effect(() => {
      if (this.isDisabled()) {
        this.selectControl.disable({ emitEvent: false });
      } else {
        this.selectControl.enable({ emitEvent: false });
      }
    });
  }

  public writeValue(value: string | null): void {
    this.selectControl.setValue(value || null, { emitEvent: false });
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
