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
  ) { 
    // Check if user is already logged in
    this.loadStoredUser();
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
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      return token;
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
            // Store token and user data
            const storage = rememberMe ? localStorage : sessionStorage;
            
            // Clear both storage types first to avoid conflicts
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_data');
            
            // Then store in the appropriate storage
            storage.setItem('auth_token', response.token);
            storage.setItem('user_data', JSON.stringify(response.user));
            
            console.log('Stored token and user data in', rememberMe ? 'localStorage' : 'sessionStorage');
            console.log('User data:', response.user);
          }
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