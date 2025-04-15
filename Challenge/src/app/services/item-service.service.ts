import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeaturedItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeaturedItemService {
  private apiUrl = 'api/home/featured-items';

  constructor(private http: HttpClient) { }

  getFeaturedItems(): Observable<FeaturedItem[]> {
    return this.http.get<FeaturedItem[]>(this.apiUrl);
  }
}