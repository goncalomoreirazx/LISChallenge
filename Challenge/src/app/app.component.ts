import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Dashboard Application';

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Restore authentication state on component initialization
    this.authService.restoreAuthState();
    
    // Debug auth state in development mode
    if (isPlatformBrowser(this.platformId) && !environment.production) {
      console.log('Development mode detected, debugging auth state:');
      this.authService.debugAuthState();
    }
  }
}

// Add environment import to avoid errors
import { environment } from './environment/environment';