import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TuiSwitch } from '@taiga-ui/kit';

import { ThemeService } from 'app/shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [FormsModule, TuiSwitch],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.effectiveTheme;

  protected setTheme(dark: boolean): void {
    this.themeService.setTheme(dark ? 'dark' : 'light');
  }
}
