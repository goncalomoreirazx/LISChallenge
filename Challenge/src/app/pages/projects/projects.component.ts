import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { ProjectListComponent } from '../../components/dashboard/project-list/project-list.component';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ProjectListComponent]
})
export class ProjectsComponent implements OnInit {
  // Track sidebar collapsed state
  sidebarCollapsed = false;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Any initialization code can go here
  }
  
  // Receive sidebar state changes
  onSidebarStateChanged(event: boolean) {
    this.sidebarCollapsed = event;
  }
  
  logout() {
    this.authService.logout();
  }
}