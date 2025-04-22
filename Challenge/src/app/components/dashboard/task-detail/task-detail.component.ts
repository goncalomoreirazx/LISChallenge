// src/app/components/dashboard/task-detail/task-detail.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../../services/task.service';
import { AuthService } from '../../../services/auth-service.service';
import { ProjectService } from '../../../services/project.service';
import { TimeTrackingComponent } from '../time-tracking/time-tracking.component';

interface TimeEntry {
  taskId: number;
  taskName: string;
  date: string;
  hours: number;
  notes: string;
}

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TimeTrackingComponent]
})
export class TaskDetailComponent implements OnInit {
  @Input() taskId!: number;
  @Input() projectId!: number;
  @Output() closeDetail = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();
  
  task: Task | null = null;
  availableProgrammers: any[] = [];
  loading = true;
  error: string | null = null;
  
  // For editing task
  isEditing = false;
  editedTask = {
    name: '',
    description: '',
    deadline: '',
    assigneeId: 0,
    status: ''
  };
  
  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTask();
    if (this.authService.isProjectManager()) {
      this.loadProjectProgrammers();
    }
  }

  loadTask(): void {
    this.loading = true;
    this.error = null;
    
    this.taskService.getTask(this.taskId).subscribe({
      next: (data) => {
        this.task = data;
        this.loading = false;
        
        // Initialize edit form with current values
        this.resetEditForm();
      },
      error: (err) => {
        this.error = 'Failed to load task details. Please try again.';
        this.loading = false;
        console.error('Error loading task', err);
      }
    });
  }
  
  loadProjectProgrammers(): void {
    this.projectService.getProjectProgrammers(this.projectId).subscribe({
      next: (programmers) => {
        this.availableProgrammers = programmers;
      },
      error: (err) => {
        console.error('Error loading project programmers', err);
      }
    });
  }

  // Toggle edit mode
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.resetEditForm();
    }
  }

  // Reset edit form to current task values
  resetEditForm(): void {
    if (this.task) {
      this.editedTask = {
        name: this.task.name,
        description: this.task.description || '',
        deadline: this.getFormattedDate(new Date(this.task.deadline)),
        assigneeId: this.task.assigneeId,
        status: this.task.status
      };
    }
    this.formError = null;
  }

  // Submit edited task
submitEditedTask(): void {
  // Validate form
  if (!this.editedTask.name) {
    this.formError = 'Task name is required';
    return;
  }
  
  if (!this.editedTask.deadline) {
    this.formError = 'Deadline is required';
    return;
  }
  
  if (this.editedTask.assigneeId === 0) {
    this.formError = 'You must select a programmer';
    return;
  }

  this.isSubmitting = true;
  this.formError = null;
  
  // Create a clean object with only the fields to update
  const taskToUpdate: any = {
    name: this.editedTask.name.trim(),
    description: this.editedTask.description,
    deadline: new Date(this.editedTask.deadline).toISOString(),
    assigneeId: this.editedTask.assigneeId
  };
  
  // Only add status if user is a programmer
  if (this.authService.isProgrammer()) {
    taskToUpdate.status = this.editedTask.status;
  }

  this.taskService.updateTask(this.taskId, taskToUpdate).subscribe({
    next: () => {
      // Exit edit mode and reload task
      this.isEditing = false;
      this.isSubmitting = false;
      this.loadTask();
      
      // Notify parent component that task was updated
      this.taskUpdated.emit();
    },
    error: (err) => {
      this.isSubmitting = false;
      if (err.error && err.error.message) {
        this.formError = err.error.message;
      } else if (err.status === 400) {
        this.formError = 'Invalid task data. Please check your inputs.';
      } else {
        this.formError = 'Failed to update task. Please try again.';
      }
      console.error('Error updating task', err);
    }
  });
}
  // Delete the current task
  deleteTask(): void {
    if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
      this.taskService.deleteTask(this.taskId).subscribe({
        next: () => {
          // Notify parent component to update task list and close detail view
          this.taskUpdated.emit();
          this.closeDetail.emit();
        },
        error: (err) => {
          alert('Failed to delete task. Please try again.');
          console.error('Error deleting task', err);
        }
      });
    }
  }
  
  updateTaskStatus(status: string): void {
    // Check user permissions
    const currentUser = this.authService.currentUserValue;
    
    // Programmers can only update their own tasks' status
    if (this.authService.isProgrammer() && 
        this.task && this.task.assigneeId !== currentUser?.id) {
      alert('You can only update tasks assigned to you.');
      return;
    }
    
    // Programmers can't set tasks to "Bloqueada" (Blocked)
    if (this.authService.isProgrammer() && status === 'Bloqueada') {
      alert('Programmers cannot set tasks to Blocked status. Please contact a Project Manager.');
      return;
    }
    
    this.taskService.updateTaskStatus(this.taskId, status).subscribe({
      next: () => {
        // Update local task status
        if (this.task) {
          this.task.status = status;
          if (status === 'Concluída') {
            this.task.completedAt = new Date().toISOString();
          } else {
            this.task.completedAt = null;
          }
        }
        
        // Notify parent component that task was updated
        this.taskUpdated.emit();
      },
      error: (err) => {
        alert('Failed to update task status. Please try again.');
        console.error('Error updating task status', err);
      }
    });
  }


  // Handle time logged from time tracking component
  onTimeLogged(entry: TimeEntry): void {
    // In a production app, you would update the task or save this data
    console.log('Time logged:', entry);
    
    // Optionally show a success message
    // You could add a toast notification system here
  }

  // Helper functions
  getFormattedDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

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
  
  // Close detail view
  close(): void {
    this.closeDetail.emit();
  }
}