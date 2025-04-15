import { Routes } from '@angular/router';
import { LoginComponent } from '../app/pages/login/login.component';
import { RegisterComponent } from '../app/pages/register/register.component';
import { DashboardComponent } from '../app/pages/dashboard/dashboard.component';
import { AuthGuard } from './guard/auth-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  // Dashboard section routes with protection
  { 
    path: 'profile', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'projectos', // Project Manager specific route
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { requiredUserType: 1 } // 1 = Project Manager
  },
  { 
    path: 'tarefas', // Programmer specific route
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { requiredUserType: 2 } // 2 = Programmer
  },
  { 
    path: 'settings', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'help', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' } // Redirect to login for any undefined routes
];