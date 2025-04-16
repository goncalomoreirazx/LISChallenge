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
      console.log('Adding token to request:', request.url);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('No token available for request:', request.url);
      
      // Don't intercept login/register requests
      if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
        return next(request);
      }
      
      // If we're not authenticated and trying to access a protected resource, 
      // redirect to login instead of making the request
      if (isPlatformBrowser(platformId) && authService.isLoggedIn() === false) {
        router.navigate(['/login']);
        return throwError(() => new Error('Not authenticated'));
      }
    }
  }

  // Handle the request and catch any authentication errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        console.log('401 Unauthorized - logging out');
        // If unauthorized, log out the user and redirect to login page
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};