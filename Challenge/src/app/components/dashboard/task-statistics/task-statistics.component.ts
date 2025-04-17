// src/app/components/dashboard/task-statistics/task-statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

@Component({
  selector: 'app-task-statistics',
  templateUrl: './task-statistics.component.html',
  styleUrls: ['./task-statistics.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TaskStatisticsComponent implements OnInit {
  stats: TaskStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.http.get<TaskStats>(`${environment.apiUrl}/tasks/my-tasks/stats`)
      .pipe(
        catchError(err => {
          console.error('Error loading task statistics', err);
          this.error = 'Failed to load statistics';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          this.stats = data;
        }
        this.loading = false;
      });
  }

  getCompletionPercentage(): string {
    return this.stats ? `${Math.round(this.stats.completionRate * 100)}%` : '0%';
  }
}