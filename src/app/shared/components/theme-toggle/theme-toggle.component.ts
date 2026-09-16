import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TuiSwitch } from '@taiga-ui/kit';

import { ThemeService } from 'app/shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TuiSwitch],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;

  protected toggle(): void {
    this.themeService.toggle();
  }
}
