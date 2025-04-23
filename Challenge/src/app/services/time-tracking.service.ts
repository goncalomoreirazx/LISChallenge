import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environment/environment';

export interface TimeEntry {
  id: number;
  taskId: number;
  taskName: string;
  userId: number;
  userName: string;
  date: string;
  hours: number;
  notes?: string;
  createdAt: string;
}

export interface TimeEntrySummary {
  taskId: number;
  totalHours: number;
  entriesCount: number;
  lastEntryDate?: string;
  lastEntryHours?: number;
}

export interface CreateTimeEntry {
  taskId: number;
  date: string;
  hours: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {
  private apiUrl = `${environment.apiUrl}/time-tracking`;

  constructor(private http: HttpClient) { }

  getTimeEntriesForTask(taskId: number): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.apiUrl}/task/${taskId}`).pipe(
      catchError(error => {
        console.error('Error fetching time entries:', error);
        return throwError(() => error);
      })
    );
  }

  getTimeEntrySummary(taskId: number): Observable<TimeEntrySummary> {
    return this.http.get<TimeEntrySummary>(`${this.apiUrl}/summary/task/${taskId}`).pipe(
      catchError(error => {
        console.error('Error fetching time entry summary:', error);
        return throwError(() => error);
      })
    );
  }

  createTimeEntry(entry: CreateTimeEntry): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(this.apiUrl, entry).pipe(
      catchError(error => {
        console.error('Error creating time entry:', error);
        return throwError(() => error);
      })
    );
  }
}