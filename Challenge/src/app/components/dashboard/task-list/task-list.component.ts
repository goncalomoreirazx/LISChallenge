import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { AuthService, User } from '../../../services/auth-service.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskListComponent implements OnInit {
  @Input() projectId!: number;
  
  tasks: Task[] = [];
  availableProgrammers: User[] = [];
  loading = true;
  error: string | null = null;
  
  // For new task form
  showNewTaskForm = false;
  newTask = {
    name: '',
    description: '',
    deadline: this.getFormattedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Default 1 week from now
    assigneeId: 0
  };
  
  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    if (this.authService.isProjectManager()) {
      this.loadProgrammers();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    
    this.taskService.getProjectTasks(this.projectId).subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks', err);
      }
    });
  }

  loadProgrammers(): void {
    this.userService.getProgrammers().subscribe({
      next: (programmers) => {
        this.availableProgrammers = programmers;
      },
      error: (err) => {
        console.error('Error loading programmers', err);
      }
    });
  }

  // Toggle new task form
  toggleNewTaskForm(): void {
    this.showNewTaskForm = !this.showNewTaskForm;
    if (!this.showNewTaskForm) {
      // Reset form when hiding
      this.resetForm();
    }
  }

  // Reset form fields
  resetForm(): void {
    this.newTask = {
      name: '',
      description: '',
      deadline: this.getFormattedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      assigneeId: 0
    };
    this.formError = null;
  }

  // Submit new task
  submitNewTask(): void {
    // Validate form
    if (!this.newTask.name) {
      this.formError = 'Task name is required';
      return;
    }
    
    if (!this.newTask.deadline) {
      this.formError = 'Deadline is required';
      return;
    }
    
    if (this.newTask.assigneeId === 0) {
      this.formError = 'You must select a programmer';
      return;
    }
  
    this.isSubmitting = true;
    this.formError = null;
    
    // Create task object
    const taskToSubmit = {
      name: this.newTask.name.trim(),
      description: this.newTask.description ? this.newTask.description.trim() : null,
      deadline: new Date(this.newTask.deadline).toISOString(),
      projectId: this.projectId,
      assigneeId: this.newTask.assigneeId,
      status: 'Pendente'
    };
  
    this.taskService.createTask(taskToSubmit).subscribe({
      next: () => {
        // Reset form and close it
        this.resetForm();
        this.showNewTaskForm = false;
        this.isSubmitting = false;
        
        // Reload tasks to show the new one
        this.loadTasks();
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.error && err.error.message) {
          this.formError = err.error.message;
        } else if (err.status === 400) {
          this.formError = 'Invalid task data. Please check your inputs.';
        } else {
          this.formError = 'Failed to create task. Please try again.';
        }
        console.error('Error creating task', err);
      }
    });
  }

  // Delete a task
  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task? This cannot be undone.')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          // Remove from local array
          this.tasks = this.tasks.filter(t => t.id !== id);
        },
        error: (err) => {
          alert('Failed to delete task. Please try again.');
          console.error('Error deleting task', err);
        }
      });
    }
  }

  // Update task status
  updateTaskStatus(id: number, status: string): void {
    this.taskService.updateTaskStatus(id, status).subscribe({
      next: () => {
        // Update local task
        const task = this.tasks.find(t => t.id === id);
        if (task) {
          task.status = status;
          if (status === 'Concluída') {
            task.completedAt = new Date().toISOString();
          } else {
            task.completedAt = null;
          }
        }
      },
      error: (err) => {
        alert('Failed to update task status. Please try again.');
        console.error('Error updating task status', err);
      }
    });
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
}