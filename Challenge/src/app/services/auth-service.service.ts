import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
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
  private apiUrl = `${environment.apiUrl}/auth`; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log(`Auth service constructor - isBrowser: ${this.isBrowser}`);
    
    // Only attempt to load from storage in browser context
    if (this.isBrowser) {
      // Try to get user data
      try {
        const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          console.log('User loaded in constructor:', user);
        }
      } catch (error) {
        console.error('Error loading stored user data in constructor', error);
        this.logout();
      }
    }
  }

  /**
   * Restore authentication state from storage
   */
  restoreAuthState(): void {
    console.log(`Restoring auth state - isBrowser: ${this.isBrowser}`);
    
    if (!this.isBrowser) {
      console.log('Not in browser context, skipping auth state restoration');
      return;
    }
    
    try {
      // Load user data
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        console.log('User restored from storage:', user);
        console.log('Token exists:', !!token);
      } else {
        console.log('No complete auth data found in storage');
        if (userData || token) {
          // Clear partial data
          this.clearStorageData();
        }
      }
    } catch (error) {
      console.error('Error during auth state restoration', error);
      this.clearStorageData();
    }
  }

  private clearStorageData(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    
    const currentUser = this.currentUserValue;
    const token = this.getToken();
    const isLoggedIn = currentUser !== null && token !== null;
    
    console.log('isLoggedIn check:', isLoggedIn, 'User:', !!currentUser, 'Token:', !!token);
    return isLoggedIn;
  }

  public getToken(): string | null {
    if (!this.isBrowser) return null;
    
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return token;
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
    console.log('Login attempt:', email, 'isBrowser:', this.isBrowser);
    
    if (!this.isBrowser) {
      console.error('Login attempted in non-browser environment');
      return throwError(() => new Error('Cannot login in server environment'));
    }
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password, rememberMe })
      .pipe(
        tap(response => {
          console.log('Login successful, received response with token length:', response.token?.length);
          console.log('User data:', response.user);
          
          if (!this.isBrowser) {
            console.error('Cannot store auth data in non-browser environment');
            return;
          }
          
          // Clear any previous data
          this.clearStorageData();
            
          try {
            // Store token and user data based on rememberMe flag
            if (rememberMe) {
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('user_data', JSON.stringify(response.user));
              console.log('Stored in localStorage');
            } else {
              sessionStorage.setItem('auth_token', response.token);
              sessionStorage.setItem('user_data', JSON.stringify(response.user));
              console.log('Stored in sessionStorage');
            }
            
            // Verify storage
            const storedToken = this.getToken();
            console.log('Token stored successfully:', !!storedToken);
            
            if (!storedToken) {
              console.error('Failed to store token in browser storage');
              throw new Error('Failed to store authentication data');
            }
            
            // Update current user subject
            this.currentUserSubject.next(response.user);
          } catch (error) {
            console.error('Error storing auth data', error);
            this.clearStorageData();
            throw error;
          }
        }),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('Logging out user, isBrowser:', this.isBrowser);
    
    // Clear storage data
    this.clearStorageData();
    
    // Force a hard refresh and redirect to login
    if (this.isBrowser) {
      window.location.href = '/login';
    }
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