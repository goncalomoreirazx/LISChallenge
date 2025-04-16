import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { isPlatformBrowser } from '@angular/common';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Only add auth token in browser context
  if (isPlatformBrowser(platformId)) {
    // Get the auth token
    const token = authService.getToken();

    // If token exists, clone the request and add the authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Handle the request and catch any authentication errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        // If unauthorized, log out the user and redirect to login page
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};