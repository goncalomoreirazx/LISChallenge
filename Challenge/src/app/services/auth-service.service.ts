import { Injectable, inject, PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient, private router: Router) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Check if user is already logged in, but only in browser environment
    if (this.isBrowser) {
      this.loadStoredUser();
    }
  }

  private loadStoredUser(): void {
    // Only execute this in browser environment
    if (!this.isBrowser) return;
    
    // Try to get user from localStorage, then sessionStorage
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data', error);
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    if (!this.isBrowser) return null;
    
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Only store token and user data in browser environment
          if (this.isBrowser) {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('auth_token', response.token);
            storage.setItem('user_data', JSON.stringify(response.user));
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
    // Only clear storage in browser environment
    if (this.isBrowser) {
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