import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';

export interface Task {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  deadline: string;
  status: string;
  completedAt: string | null;
  projectId: number;
  assigneeId: number;
  assigneeName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  // Get tasks for a specific project
  getProjectTasks(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/projects/${projectId}/tasks`).pipe(
      catchError(error => {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Get a specific task by ID
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Create a new task
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap(response => console.log('Task created:', response)),
      catchError(error => {
        console.error('Error creating task:', error);
        return throwError(() => error);
      })
    );
  }

  // Update an existing task
  updateTask(id: number, task: Partial<Omit<Task, 'id' | 'createdAt'>>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task).pipe(
      catchError(error => {
        console.error(`Error updating task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Delete a task
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Update task status
  updateTaskStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => {
        console.error(`Error updating status for task ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}