import { Component, HostListener, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  @Output() sidebarStateChanged = new EventEmitter<boolean>();
  
  menuItems = [
    { icon: 'bi bi-speedometer2', label: 'Dashboard', link: '/dashboard' },
    { icon: 'bi bi-person', label: 'Profile', link: '/profile' },
    { icon: 'bi bi-bar-chart', label: 'Projectos', link: '/projectos' },
    { icon: 'bi bi-gear', label: 'Tarefas', link: '/tarefas' },
    { icon: 'bi bi-question-circle', label: 'Help', link: '/help' }
  ];
  
  isCollapsed = false;
  isMobile = false;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    } else {
      // Default values for server-side rendering
      this.isMobile = false;
      this.isCollapsed = false;
    }
    
    // Emit initial state
    this.sidebarStateChanged.emit(this.isCollapsed);
  }
  
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
      // Auto-collapse sidebar on mobile
      if (this.isMobile) {
        this.isCollapsed = true;
        this.sidebarStateChanged.emit(this.isCollapsed);
      }
    }
  }
  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarStateChanged.emit(this.isCollapsed);
  }
  
  // Close sidebar when an item is clicked on mobile
  onMenuItemClick() {
    if (this.isMobile) {
      this.isCollapsed = true;
      this.sidebarStateChanged.emit(this.isCollapsed);
    }
  }
  
  logout() {
    this.authService.logout();
  }
}