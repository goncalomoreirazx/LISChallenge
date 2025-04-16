import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { AuthService, User } from './auth-service.service';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  budget: number | null;
  createdAt: string;
  managerId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper to get auth headers (although the interceptor should handle this)
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get all projects accessible to the current user
   */
  getProjects(): Observable<Project[]> {
    console.log('Fetching projects from:', this.apiUrl);
    return this.http.get<Project[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching projects:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific project by ID
   */
  getProject(id: number): Observable<Project> {
    console.log(`Fetching project ${id} from: ${this.apiUrl}/${id}`);
    return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching project ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new project
   */
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'managerId'>): Observable<Project> {
    console.log('Creating new project:', project);
    return this.http.post<Project>(this.apiUrl, project).pipe(
      catchError(error => {
        console.error('Error creating project:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing project
   */
  updateProject(id: number, project: Partial<Omit<Project, 'id' | 'createdAt' | 'managerId'>>): Observable<void> {
    console.log(`Updating project ${id}:`, project);
    return this.http.put<void>(`${this.apiUrl}/${id}`, project).pipe(
      catchError(error => {
        console.error(`Error updating project ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a project
   */
  deleteProject(id: number): Observable<void> {
    console.log(`Deleting project ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting project ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
 * Get available programmers for allocation
 */
getAvailableProgrammers(): Observable<User[]> {
  return this.http.get<User[]>(`${environment.apiUrl}/users/programmers`).pipe(
    catchError(error => {
      console.error('Error fetching programmers:', error);
      return throwError(() => error);
    })
  );
}

/**
 * Get programmers allocated to a project
 */
getProjectProgrammers(id: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${id}/programmers`).pipe(
    catchError(error => {
      console.error(`Error fetching programmers for project ${id}:`, error);
      return throwError(() => error);
    })
  );
}

/**
 * Allocate programmers to a project
 */
allocateProgrammers(id: number, programmerIds: number[]): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/${id}/programmers`, programmerIds).pipe(
    catchError(error => {
      console.error(`Error allocating programmers to project ${id}:`, error);
      return throwError(() => error);
    })
  );
}


}