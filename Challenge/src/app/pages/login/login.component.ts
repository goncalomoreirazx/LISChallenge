import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
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
        this.isSubmitting = false;
        console.log('Login successful, navigating to dashboard');
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
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