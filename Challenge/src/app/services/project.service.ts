import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

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

  constructor(private http: HttpClient) { }

  /**
   * Get all projects accessible to the current user
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  /**
   * Get a specific project by ID
   */
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new project
   */
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'managerId'>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  /**
   * Update an existing project
   */
  updateProject(id: number, project: Partial<Omit<Project, 'id' | 'createdAt' | 'managerId'>>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }

  /**
   * Delete a project
   */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}