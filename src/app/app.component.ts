import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TuiRoot } from '@taiga-ui/core';

import { OneCIntegrationApiService } from './shared/api/onec-integration-api.service';
import { AppInitializationService } from './shared/services/app-initialization.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly initialization = inject(AppInitializationService);
  private readonly themeService = inject(ThemeService);
  private readonly oneCIntegrationApiService = inject(OneCIntegrationApiService);

  protected readonly theme = this.themeService.preference;
}
