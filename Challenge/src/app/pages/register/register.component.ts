import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule]
})
export class RegisterComponent {
  registerData = {
    fullName: '',
    email: '',
    userType: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };
  
  errorMessage = '';
  isSubmitting = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // Reset error message
    this.errorMessage = '';
    
    // Check if passwords match
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    // Check password length
    if (this.registerData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    
    // Prepare data for API
    const userData = {
      fullName: this.registerData.fullName,
      email: this.registerData.email,
      userType: parseInt(this.registerData.userType),
      password: this.registerData.password
    };
    
    // Call the API
    this.http.post('/api/auth/register', userData)
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful', response);
          this.isSubmitting = false;
          
          // Navigate to login page
          this.router.navigate(['/login'], { 
            queryParams: { 
              registered: 'success',
              email: this.registerData.email
            }
          });
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.isSubmitting = false;
          
          // Handle API errors
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists. Please use a different email.';
          } else {
            this.errorMessage = 'Registration failed. Please try again later.';
          }
        }
      });
  }
}