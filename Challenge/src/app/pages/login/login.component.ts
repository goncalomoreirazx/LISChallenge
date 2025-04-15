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
    // Check if user just registered
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.registrationSuccess = true;
        this.loginData.email = params['email'] || '';
      }
    });
  }

  onSubmit() {
    // Reset error message
    this.errorMessage = '';
    
    // Set submitting state
    this.isSubmitting = true;
    
    // Call the auth service
    this.authService.login(
      this.loginData.email,
      this.loginData.password,
      this.loginData.rememberMe
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        
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