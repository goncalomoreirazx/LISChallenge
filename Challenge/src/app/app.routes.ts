import { Routes } from '@angular/router';
import { LoginComponent } from '../app/pages/login/login.component';
import { RegisterComponent } from '../app/pages/register/register.component';
import { DashboardComponent } from '../app/pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  // Dashboard section routes
  { path: 'profile', component: DashboardComponent },
  { path: 'analytics', component: DashboardComponent },
  { path: 'settings', component: DashboardComponent },
  { path: 'help', component: DashboardComponent },
  { path: '**', redirectTo: 'login' } // Redirect to login for any undefined routes
];