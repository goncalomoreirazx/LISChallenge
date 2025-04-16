import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule]
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  errorMessage = '';
  isSubmitting = false;
  registrationSuccess = false;
  private isBrowser: boolean;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log(`Login component constructor - isBrowser: ${this.isBrowser}`);
  }

  ngOnInit() {
    console.log(`Login component ngOnInit - isBrowser: ${this.isBrowser}`);
    
    // Only perform browser-specific operations when in browser context
    if (!this.isBrowser) {
      console.log('Skipping browser-specific operations in server context');
      return;
    }
    
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
      return;
    }

    // Check if user just registered
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.registrationSuccess = true;
        this.loginData.email = params['email'] || '';
        console.log('Registration success detected, pre-filled email:', this.loginData.email);
      }
    });
  }

  onSubmit() {
    console.log(`Login submission - isBrowser: ${this.isBrowser}`);
    
    if (!this.isBrowser) {
      this.errorMessage = 'Cannot perform login in server environment';
      return;
    }
    
    // Reset error message
    this.errorMessage = '';
    
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    console.log('Attempting login with email:', this.loginData.email);
    
    // Call the auth service
    this.authService.login(
      this.loginData.email,
      this.loginData.password,
      this.loginData.rememberMe
    ).subscribe({
      next: (response) => {
        console.log('Login service response received');
        this.isSubmitting = false;
        console.log('Login successful, token received:', !!response.token);
        console.log('User data:', response.user);
        
        // Double-check if token was stored
        setTimeout(() => {
          // Check if token was stored successfully
          const tokenStored = !!this.authService.getToken();
          console.log('Token stored successfully:', tokenStored);
          
          if (tokenStored) {
            // Navigate to dashboard
            this.router.navigate(['/dashboard']);
          } else {
            // Handle token storage failure
            this.errorMessage = 'Failed to store authentication token. Please try again or contact support.';
          }
        }, 100); // Small timeout to ensure storage is complete
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Login failed:', error);
        
        // Handle API errors
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      }
    });
  }
}