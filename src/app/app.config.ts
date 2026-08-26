import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { provideEventPlugins } from '@taiga-ui/event-plugins';

import { routes } from './app.routes';
import { initializeApplication } from './shared/initializers/app.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideEventPlugins(),
    provideAppInitializer(initializeApplication),
  ],
};
