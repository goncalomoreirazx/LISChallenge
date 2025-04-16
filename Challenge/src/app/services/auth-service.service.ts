import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environment/environment';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  fullName: string;
  email: string;
  userType: number;
  userTypeDescription: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiration: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Using environment configuration
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Restore authentication state from storage
   * Called during app initialization to restore user session
   */
  restoreAuthState(): void {
    console.log('Restoring auth state...');
    if (isPlatformBrowser(this.platformId)) {
      this.loadStoredUser();
      const isLoggedIn = this.isLoggedIn();
      console.log('Auth state restored. User logged in:', isLoggedIn);
    } else {
      console.log('Not in browser context, skipping auth state restoration');
    }
  }

  /**
   * Debug authentication state
   * Logs current authentication details for debugging purposes
   */
  debugAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      const user = this.currentUserValue;
      
      console.log('===== Auth State Debug =====');
      console.log('Platform:', isPlatformBrowser(this.platformId) ? 'Browser' : 'Server');
      console.log('User:', user ? `${user.fullName} (${user.email})` : 'None');
      console.log('User Type:', user ? (user.userType === 1 ? 'Project Manager' : 'Programmer') : 'N/A');
      console.log('Token exists:', !!token);
      if (token) {
        // Get expiration time from token without exposing the token in logs
        try {
          const tokenParts = token.split('.');
          const tokenBody = JSON.parse(atob(tokenParts[1]));
          const expTime = new Date(tokenBody.exp * 1000);
          console.log('Token expires:', expTime.toLocaleString());
          console.log('Token expired:', expTime < new Date());
        } catch (e) {
          console.log('Could not decode token expiration');
        }
      }
      console.log('Local Storage Token:', !!localStorage.getItem('auth_token'));
      console.log('Session Storage Token:', !!sessionStorage.getItem('auth_token'));
      console.log('===========================');
    } else {
      console.log('Auth debug not available in server context');
    }
  }

  private loadStoredUser(): void {
    // Only attempt to load from storage in browser context
    if (isPlatformBrowser(this.platformId)) {
      // Try to get user from localStorage, then sessionStorage
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          console.log('User loaded from storage:', user);
        } catch (error) {
          console.error('Error parsing stored user data', error);
          this.logout();
        }
      } else {
        console.log('No user data found in storage');
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    // First check if we have a current user
    const currentUser = this.currentUserValue;
    
    // Then check if we have a token
    const token = this.getToken();
    
    const isLoggedIn = currentUser !== null && token !== null;
    console.log('isLoggedIn check:', isLoggedIn, 'User:', !!currentUser, 'Token:', !!token);
    
    return isLoggedIn;
  }

  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  register(userData: {
    fullName: string;
    email: string;
    userType: number;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(error => {
          console.error('Registration error', error);
          return throwError(() => error);
        })
      );
  }

  login(email: string, password: string, rememberMe: boolean): Observable<LoginResponse> {
    console.log('Login attempt:', email);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password, rememberMe })
      .pipe(
        tap(response => {
          console.log('Login successful, storing user data and token');
          
          // Only store in browser storage when in browser context
          if (isPlatformBrowser(this.platformId)) {
            // Store token and user data based on rememberMe flag
            if (rememberMe) {
              // Store in localStorage for persistent login
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('user_data', JSON.stringify(response.user));
              
              // Clear sessionStorage to avoid conflicts
              sessionStorage.removeItem('auth_token');
              sessionStorage.removeItem('user_data');
              
              console.log('Stored token and user data in localStorage');
            } else {
              // Store in sessionStorage for session-only login
              sessionStorage.setItem('auth_token', response.token);
              sessionStorage.setItem('user_data', JSON.stringify(response.user));
              
              // Clear localStorage to avoid conflicts
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              
              console.log('Stored token and user data in sessionStorage');
            }
            
            console.log('User data:', response.user);
            console.log('Token stored successfully:', !!this.getToken());
          }
          
          // Update current user subject regardless of storage
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    
    // Only clear browser storage when in browser context
    if (isPlatformBrowser(this.platformId)) {
      // Remove user from local storage and set current user to null
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Check if user is a project manager
  isProjectManager(): boolean {
    const user = this.currentUserValue;
    return user ? user.userType === 1 : false;
  }

  // Check if user is a programmer
  isProgrammer(): boolean {
    const user = this.currentUserValue;
    return user ? user.userType === 2 : false;
  }
}