// src/app/pages/programmer-tasks/programmer-tasks.component.ts
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { AuthService } from '../../services/auth-service.service';
import { TaskService, Task } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from '../../components/dashboard/task-detail/task-detail.component';
import { TaskStatisticsComponent } from '../../components/dashboard/task-statistics/task-statistics.component';

@Component({
  selector: 'app-programmer-tasks',
  templateUrl: './programmer-tasks.component.html',
  styleUrls: ['./programmer-tasks.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent, TaskDetailComponent, TaskStatisticsComponent]
})
export class ProgrammerTasksComponent implements OnInit {
  // Track sidebar collapsed state
  sidebarCollapsed = false;
  
  // Tasks data
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = true;
  error: string | null = null;
  
  // Task detail view
  selectedTaskId: number | null = null;
  
  // Filters
  statusFilter: string = 'all';
  searchQuery: string = '';

  // Page title based on user role
  pageTitle: string = 'My Tasks';
  
  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit() {
    console.log('ProgrammerTasksComponent initialized');
    console.log('Current user:', this.authService.currentUserValue);
    
    // Set page title based on user role
    if (this.authService.isProjectManager()) {
      console.log('User is a Project Manager');
      this.pageTitle = 'Tasks Overview';
    } else if (this.authService.isProgrammer()) {
      console.log('User is a Programmer');
      this.pageTitle = 'My Tasks';
    } else {
      console.log('User type unknown or not authenticated');
      this.pageTitle = 'Tasks';
    }
    
    // Only try to load tasks in browser context
    if (isPlatformBrowser(this.platformId)) {
      console.log('Loading tasks...');
      this.loadTasks();
    } else {
      console.log('Skipping task loading in server context');
      this.loading = false;
    }
  }
  
  // Receive sidebar state changes
  onSidebarStateChanged(event: boolean) {
    this.sidebarCollapsed = event;
  }
  
  loadTasks() {
    this.loading = true;
    this.error = null;
    
    this.taskService.getProgrammerTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        console.log('Tasks loaded successfully:', this.tasks);
        console.log('Number of tasks:', this.tasks.length);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        this.tasks = [];
        this.filteredTasks = [];
      }
    });
  }
  
  applyFilters() {
    console.log('Before filtering - total tasks:', this.tasks.length);
    
    // Make a copy of the tasks array
    let result = [...this.tasks];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(task => task.status === this.statusFilter);
      console.log(`After status filter (${this.statusFilter}):`, result.length);
    }
    
    // Apply search filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(task => 
        task.name.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
      console.log(`After search filter (${this.searchQuery}):`, result.length);
    }
    
    this.filteredTasks = result;
    console.log('Final filtered tasks:', this.filteredTasks.length);
  }
  
  onStatusFilterChange() {
    console.log('Status filter changed to:', this.statusFilter);
    this.applyFilters();
  }
  
  onSearchChange() {
    console.log('Search query changed to:', this.searchQuery);
    this.applyFilters();
  }
  
  viewTaskDetails(taskId: number) {
    console.log('Viewing task details for task ID:', taskId);
    this.selectedTaskId = taskId;
  }
  
  onTaskUpdated() {
    console.log('Task updated, reloading tasks');
    this.loadTasks();
  }
  
  closeTaskDetail() {
    console.log('Closing task detail view');
    this.selectedTaskId = null;
  }
  
  // Check if user can mark task as complete (only programmers and their own tasks)
  canMarkAsComplete(task: Task): boolean {
    const isProgrammer = this.authService.isProgrammer();
    const isOwnTask = task.assigneeId === this.authService.currentUserValue?.id;
    const isNotCompleted = task.status !== 'Concluída';
    
    return isProgrammer && isOwnTask && isNotCompleted;
  }
  
  markTaskAsComplete(taskId: number) {
    console.log('Marking task as complete:', taskId);
    this.taskService.updateTaskStatus(taskId, 'Concluída').subscribe({
      next: () => {
        console.log('Task successfully marked as complete');
        // Update task in the local array
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          this.tasks[taskIndex].status = 'Concluída';
          this.tasks[taskIndex].completedAt = new Date().toISOString();
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error updating task status', err);
        alert('Failed to update task status. Please try again.');
      }
    });
  }
  
  // Helper methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  isOverdue(deadline: string): boolean {
    return new Date(deadline) < new Date() && deadline != null;
  }
  
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
    console.log('Logging out user');
    this.authService.logout();
  }
}