import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FeaturedItemService, FeaturedItem } from '../../services/item-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class HomeComponent implements OnInit {
  
  featuredItems: FeaturedItem[] = [
    {
      id: 1,
      title: 'Service One',
      description: 'This is a description of our first service offering.',
      imageUrl: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      title: 'Service Two',
      description: 'This is a description of our second service offering.',
      imageUrl: 'https://via.placeholder.com/300x200'
    },
    {
      id: 3,
      title: 'Service Three',
      description: 'This is a description of our third service offering.',
      imageUrl: 'https://via.placeholder.com/300x200'
    }
  ];
  
  constructor(private featuredItemService: FeaturedItemService) { }

  ngOnInit(): void {
    // Uncomment this when your API is ready
    /*
    this.featuredItemService.getFeaturedItems().subscribe({
      next: (items) => {
        this.featuredItems = items;
      },
      error: (error) => {
        console.error('Error fetching featured items:', error);
      }
    });
    */
  }
}