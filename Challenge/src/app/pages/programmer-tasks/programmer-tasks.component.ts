// src/app/pages/programmer-tasks/programmer-tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { AuthService } from '../../services/auth-service.service';
import { TaskService, Task } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from '../../components/dashboard/task-detail/task-detail.component';
import { TaskStatisticsComponent } from "../../components/dashboard/task-statistics/task-statistics.component";

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
    private taskService: TaskService
  ) {}
  
  ngOnInit() {
    // Set page title based on user role
    if (this.authService.isProjectManager()) {
      this.pageTitle = 'Tasks Overview';
    } else {
      this.pageTitle = 'My Tasks';
    }
    
    this.loadTasks();
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
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks', err);
      }
    });
  }
  
  applyFilters() {
    let result = [...this.tasks];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(task => task.status === this.statusFilter);
    }
    
    // Apply search filter
    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(task => 
        task.name.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    this.filteredTasks = result;
  }
  
  onStatusFilterChange() {
    this.applyFilters();
  }
  
  onSearchChange() {
    this.applyFilters();
  }
  
  viewTaskDetails(taskId: number) {
    this.selectedTaskId = taskId;
  }
  
  onTaskUpdated() {
    this.loadTasks();
  }
  
  closeTaskDetail() {
    this.selectedTaskId = null;
  }
  
  // Check if user can mark task as complete (only programmers and their own tasks)
  canMarkAsComplete(task: Task): boolean {
    return this.authService.isProgrammer() && 
           task.assigneeId === this.authService.currentUserValue?.id &&
           task.status !== 'Concluída';
  }
  
  markTaskAsComplete(taskId: number) {
    this.taskService.updateTaskStatus(taskId, 'Concluída').subscribe({
      next: () => {
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
    this.authService.logout();
  }
}