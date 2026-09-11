import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TuiError, TuiLabel } from '@taiga-ui/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [TuiError, TuiLabel],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  public readonly label = input.required<string>();
  public readonly controlName = input.required<string>();
}
