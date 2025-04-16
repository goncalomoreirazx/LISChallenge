import { ApplicationConfig, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptor/auth-interceptor.interceptor';
import { AuthService } from './services/auth-service.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    AuthService, // Explicitly provide AuthService
    { provide: PLATFORM_ID, useValue: PLATFORM_ID } // Ensure PLATFORM_ID is available for injection
  ]
};