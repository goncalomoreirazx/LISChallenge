import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  menuItems = [
    { icon: 'bi bi-speedometer2', label: 'Dashboard', link: '/dashboard' },
    { icon: 'bi bi-person', label: 'Profile', link: '/profile' },
    { icon: 'bi bi-bar-chart', label: 'Analytics', link: '/analytics' },
    { icon: 'bi bi-gear', label: 'Settings', link: '/settings' },
    { icon: 'bi bi-question-circle', label: 'Help', link: '/help' }
  ];
  
  isCollapsed = false;
  isMobile = false;
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  
  ngOnInit() {
    this.checkScreenSize();
  }
  
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // Auto-collapse sidebar on mobile
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  
  // Close sidebar when an item is clicked on mobile
  onMenuItemClick() {
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }
}