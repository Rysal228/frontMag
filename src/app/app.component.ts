import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import eruda from 'eruda';

import { TuiRoot } from '@taiga-ui/core';

import { AppInitializationService } from './shared/services/max/app-initialization.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected readonly initialization = inject(AppInitializationService);
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.preference;

  ngOnInit(): void {
    eruda.init();
  }
}
