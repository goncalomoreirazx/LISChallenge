import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'Dashboard Application';
  isDashboardRoute = false;
  
  constructor(private router: Router) {
    // Subscribe to router events to determine if we're on a dashboard route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if the current route is a dashboard route
      const url = event.urlAfterRedirects || event.url;
      this.isDashboardRoute = this.checkIfDashboardRoute(url);
    });
  }
  
  private checkIfDashboardRoute(url: string): boolean {
    // Add all dashboard-related routes here
    const dashboardRoutes = ['/dashboard', '/profile', '/analytics', '/settings', '/help'];
    return dashboardRoutes.some(route => url.startsWith(route));
  }
}