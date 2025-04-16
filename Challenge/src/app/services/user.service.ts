import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { User } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Get all programmers (users with type 2)
   */
  getProgrammers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/programmers`).pipe(
      catchError((error: any) => {
        console.error('Error fetching programmers:', error);
        return throwError(() => error);
      })
    );
  }
}