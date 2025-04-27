import { Component, HostListener, Inject, PLATFORM_ID, Output, EventEmitter, OnInit } from '@angular/core';
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
export class SidebarComponent implements OnInit {
  @Output() sidebarStateChanged = new EventEmitter<boolean>();
  
  // Combined menu items based on user role
  menuItems: any[] = [];
  
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
    
    // Set up menu items based on user role
    this.setupMenuItems();
    
    // Subscribe to auth changes to update menu when user logs in/out
    this.authService.currentUser$.subscribe(() => {
      this.setupMenuItems();
    });
  }
  
  private setupMenuItems() {
    // Get the current user
    const user = this.authService.currentUserValue;
    
    // Create base menu with common items
    this.menuItems = [
      { icon: 'bi bi-speedometer2', label: 'Dashboard', link: '/dashboard' },
    ];
    
    // Only add Projects for Project Managers (type 1)
    if (user && user.userType === 1) {
      this.menuItems.push(
        { icon: 'bi bi-bar-chart', label: 'Projectos', link: '/projectos' }
      );
    }
    
    // Add Tasks for both Programmers and Project Managers
    if (user && (user.userType === 1 || user.userType === 2)) {
      this.menuItems.push(
        { icon: 'bi bi-list-check', label: 'Tarefas', link: '/tarefas' }
      );
    }
    
    // Sort menu items by predefined order
    this.menuItems.sort((a, b) => {
      // Custom order: Dashboard, Profile, Projectos, Tarefas, Help
      const order: Record<string, number> = {
        'Dashboard': 1,
        'Projectos': 2,
        'Tarefas': 3,
      };
      
      return (order[a.label as string] || 99) - (order[b.label as string] || 99);
    });
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
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout();  // No need to subscribe
    }
  }
}