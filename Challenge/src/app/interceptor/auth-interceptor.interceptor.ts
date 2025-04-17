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
  const isBrowser = isPlatformBrowser(platformId);
  
  console.log(`Auth interceptor - isBrowser: ${isBrowser}, URL: ${request.url}`);
  
  // Only add auth token in browser context
  if (isBrowser) {
    // Don't intercept login/register requests
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      console.log('Skipping auth header for auth endpoints');
      return next(request);
    }
    
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
      
      // If we're not authenticated and trying to access a protected resource, 
      // redirect to login instead of making the request
      if (!authService.isLoggedIn() && !request.url.includes('/api/home')) {
        // Only redirect for API requests that might need authentication
        if (request.url.includes('/api/')) {
          console.log('Unauthenticated API request, redirecting to login');
          router.navigate(['/login']);
          return throwError(() => new Error('Not authenticated'));
        }
      }
    }
  } else {
    console.log('Running in server context, skipping auth token');
  }

  // Handle the request and catch any authentication errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      if (error.status === 401 && isBrowser) {
        console.log('401 Unauthorized - logging out');
        // If unauthorized, log out the user and redirect to login page
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};