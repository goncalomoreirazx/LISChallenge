import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
    private http: HttpClient, 
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
    
    // Prepare data for API
    const userData = {
      email: this.loginData.email,
      password: this.loginData.password,
      rememberMe: this.loginData.rememberMe
    };
    
    // Call the API
    this.http.post('/api/auth/login', userData)
      .subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          this.isSubmitting = false;
          
          // Store auth token in localStorage or sessionStorage
          if (this.loginData.rememberMe) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
          } else {
            sessionStorage.setItem('auth_token', response.token);
            sessionStorage.setItem('user_data', JSON.stringify(response.user));
          }
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed', error);
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