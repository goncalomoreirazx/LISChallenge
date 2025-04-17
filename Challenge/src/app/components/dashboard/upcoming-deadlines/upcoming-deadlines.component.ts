// src/app/components/dashboard/upcoming-deadlines/upcoming-deadlines.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService, Task } from '../../../services/task.service';

@Component({
  selector: 'app-upcoming-deadlines',
  templateUrl: './upcoming-deadlines.component.html',
  styleUrls: ['./upcoming-deadlines.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class UpcomingDeadlinesComponent implements OnInit {
  upcomingTasks: Task[] = [];
  loading = true;
  error: string | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadUpcomingTasks();
  }

  loadUpcomingTasks(): void {
    this.loading = true;
    this.error = null;

    this.taskService.getProgrammerTasks().subscribe({
      next: (tasks) => {
        // Filter and sort tasks:
        // 1. Not completed
        // 2. Due in the next 7 days
        // 3. Sorted by deadline (ascending)
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        this.upcomingTasks = tasks
          .filter(task => 
            task.status !== 'Concluída' && 
            new Date(task.deadline) >= now &&
            new Date(task.deadline) <= sevenDaysFromNow
          )
          .sort((a, b) => 
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
          .slice(0, 5); // Get top 5 upcoming tasks

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading upcoming tasks', err);
        this.error = 'Failed to load upcoming deadlines';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysRemaining(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    
    // Reset time part to compare dates only
    deadlineDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    
    // Convert to days
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  getUrgencyClass(daysRemaining: number): string {
    if (daysRemaining <= 1) {
      return 'text-danger';
    } else if (daysRemaining <= 3) {
      return 'text-warning';
    } else {
      return 'text-info';
    }
  }
}
