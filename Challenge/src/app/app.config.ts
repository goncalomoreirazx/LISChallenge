import { ApplicationConfig, PLATFORM_ID, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptor/auth-interceptor.interceptor';
import { AuthService } from './services/auth-service.service';

// Function to initialize auth state during app startup
export function initializeAuth(authService: AuthService) {
  return () => {
    // This is run during app initialization
    authService.restoreAuthState();
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    AuthService, // Explicitly provide AuthService
    { provide: PLATFORM_ID, useValue: PLATFORM_ID }, // Ensure PLATFORM_ID is available for injection
    // Add APP_INITIALIZER to restore auth state during app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};