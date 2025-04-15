import { Routes } from '@angular/router';
import { HomeComponent } from '../app/pages/home/home.component';
import { LoginComponent } from '../app/pages/login/login.component';
import { RegisterComponent } from '../app/pages/register/register.component';
import { DashboardComponent } from '../app/pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  // Add more routes for dashboard sections
  { path: 'profile', component: DashboardComponent },
  { path: 'analytics', component: DashboardComponent },
  { path: 'settings', component: DashboardComponent },
  { path: 'help', component: DashboardComponent },
  { path: '**', redirectTo: 'login' } // Redirect to login for any undefined routes
];