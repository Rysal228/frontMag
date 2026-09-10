import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { provideEventPlugins } from '@taiga-ui/event-plugins';

import { routes } from './app.routes';
import { initializeApplication } from './shared/initializers/app.initializer';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { LocalStorageToken } from './shared/storage/local-storage-role';
import { TOKEN_STORAGE } from './shared/storage/token-storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideEventPlugins(),
    provideAppInitializer(initializeApplication),
    {
      provide: TOKEN_STORAGE,
      useClass: LocalStorageToken,
    },
  ],
};
