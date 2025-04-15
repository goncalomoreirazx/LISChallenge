import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, SidebarComponent]
})
export class DashboardComponent {
  // Track sidebar collapsed state
  sidebarCollapsed = false;
  
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
  
  // Receive sidebar state changes - handle the event with correct typing
  onSidebarStateChanged(event: any) {
    // The event is the isCollapsed boolean value from the sidebar
    this.sidebarCollapsed = Boolean(event);
  }
}