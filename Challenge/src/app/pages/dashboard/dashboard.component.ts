import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { AuthService, User } from '../../services/auth-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent]
})
export class DashboardComponent implements OnInit {
  // Track sidebar collapsed state
  sidebarCollapsed = false;
  
  // Current logged in user
  currentUser: User | null = null;
  
  // Sample data for dashboard cards
  stats = [
    { title: 'Users', value: '1,254', icon: 'bi bi-people', color: 'primary' },
    { title: 'Sales', value: '$12,345', icon: 'bi bi-currency-dollar', color: 'success' },
    { title: 'Orders', value: '234', icon: 'bi bi-cart', color: 'info' },
    { title: 'Returns', value: '21', icon: 'bi bi-arrow-counterclockwise', color: 'warning' }
  ];
  
  // Sample data for recent activity
  recentActivities = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '5 minutes ago' },
    { id: 2, action: 'New order placed', user: 'Jane Smith', time: '30 minutes ago' },
    { id: 3, action: 'Payment received', user: 'Alice Johnson', time: '1 hour ago' },
    { id: 4, action: 'Customer support ticket closed', user: 'Bob Brown', time: '2 hours ago' },
    { id: 5, action: 'New comment received', user: 'Charlie Davis', time: '3 hours ago' }
  ];
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Get the current user
    this.currentUser = this.authService.currentUserValue;
    
    // Subscribe to user changes (in case user data changes during the session)
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  // Receive sidebar state changes - handle the event with correct typing
  onSidebarStateChanged(event: any) {
    // The event is the isCollapsed boolean value from the sidebar
    this.sidebarCollapsed = Boolean(event);
  }
  
  logout() {
    this.authService.logout();
  }
}