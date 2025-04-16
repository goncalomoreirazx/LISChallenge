import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from './environment/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, CommonModule]
})
export class AppComponent implements OnInit {
  title = 'Dashboard Application';
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log(`App component constructor - isBrowser: ${this.isBrowser}`);
  }

  ngOnInit(): void {
    console.log(`App component ngOnInit - isBrowser: ${this.isBrowser}`);
    
    // Only restore auth state in browser context
    if (this.isBrowser) {
      // Restore authentication state on component initialization
      setTimeout(() => {
        this.authService.restoreAuthState();
        
        // Debug auth state in development mode
        if (!environment.production) {
          console.log('Development mode detected, debugging auth state:');
          this.debugAuthState();
        }
      }, 0);
    } else {
      console.log('Skipping auth state restoration in server context');
    }
  }
  
  private debugAuthState(): void {
    if (!this.isBrowser) return;
    
    const token = this.authService.getToken();
    const user = this.authService.currentUserValue;
    
    console.log('===== Auth State Debug =====');
    console.log('Platform:', this.isBrowser ? 'Browser' : 'Server');
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
  }
}