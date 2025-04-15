import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the user is logged in
    if (this.authService.isLoggedIn()) {
      // Check if route has data specifying required user types
      const requiredUserType = route.data['requiredUserType'];
      
      if (requiredUserType !== undefined) {
        const user = this.authService.currentUserValue;
        
        // Check if user has the required type
        if (user && user.userType === requiredUserType) {
          return true;
        } else {
          // Redirect to dashboard if user doesn't have the required role
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // No specific user type required
      return true;
    }
    
    // Not logged in - redirect to login page with return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

// Factory function for Angular 15+ route guard compatibility
export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuard).canActivate(route, state);
};