import { Routes } from '@angular/router';
import { HomeComponent } from '../app/pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  // Add more routes as needed
  { path: '**', redirectTo: '' } // Redirect to home for any undefined routes
];