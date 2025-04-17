import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { AuthService, User } from '../../services/auth-service.service';
import { ProjectService, Project } from '../../services/project.service';
import { TaskService, Task } from '../../services/task.service';
import { UpcomingDeadlinesComponent } from '../../components/dashboard/upcoming-deadlines/upcoming-deadlines.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, UpcomingDeadlinesComponent]
})
export class DashboardComponent implements OnInit {
  // Track sidebar collapsed state
  sidebarCollapsed = false;
  
  // Current logged in user
  currentUser: User | null = null;
  
  // Projects
  projects: Project[] = [];
  
  // Tasks
  recentTasks: Task[] = [];
  
  // Statistics
  totalTasks = 0;
  completedTasks = 0;
  overdueTasks = 0;
  
  loading = true;
  
  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the current user
      this.currentUser = this.authService.currentUserValue;
      
      // Load data for all users
      this.loadDashboardData();
    }
  }
  
  // Load data for all users
  loadDashboardData() {
    this.loading = true;
    
    // Load projects
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        // Get most recent projects
        this.projects = projects.slice(0, 5);
        
        // Count total tasks across all projects
        let totalTaskCount = 0;
        let completedTaskCount = 0;
        let overdueTaskCount = 0;
        let allTasks: Task[] = [];
        
        // For each project, get tasks
        const projectIds = projects.map(p => p.id);
        
        if (projectIds.length === 0) {
          this.loading = false;
          return;
        }
        
        // Track number of completed requests
        let completedRequests = 0;
        
        // If there are projects, fetch their tasks
        projectIds.forEach(id => {
          this.taskService.getProjectTasks(id).subscribe({
            next: (tasks) => {
              allTasks = [...allTasks, ...tasks];
              totalTaskCount += tasks.length;
              completedTaskCount += tasks.filter(t => t.status === 'Concluída').length;
              
              const now = new Date();
              overdueTaskCount += tasks.filter(t => 
                new Date(t.deadline) < now && t.status !== 'Concluída'
              ).length;
              
              // Update stats
              this.totalTasks = totalTaskCount;
              this.completedTasks = completedTaskCount;
              this.overdueTasks = overdueTaskCount;
              
              // Count completed requests
              completedRequests++;
              
              // Once all requests are completed, sort tasks by deadline and get most recent
              if (completedRequests === projectIds.length) {
                // Sort by deadline (closest first)
                allTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                
                // Take most recent 5 tasks
                this.recentTasks = allTasks.slice(0, 5);
                this.loading = false;
              }
            },
            error: (err) => {
              console.error(`Error loading tasks for project ${id}`, err);
              
              // Still count as completed to avoid getting stuck
              completedRequests++;
              
              if (completedRequests === projectIds.length) {
                this.loading = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading projects for dashboard', err);
        this.loading = false;
      }
    });
  }
  
  // Receive sidebar state changes
  onSidebarStateChanged(event: boolean) {
    this.sidebarCollapsed = event;
  }
  
  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Check if a task is overdue
  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }
  
  // Get CSS class for task status
  getStatusClass(status: string): string {
    switch (status) {
      case 'Pendente': return 'badge bg-warning';
      case 'Em Progresso': return 'badge bg-primary';
      case 'Concluída': return 'badge bg-success';
      case 'Bloqueada': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
  
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout();
    }
  }
}
