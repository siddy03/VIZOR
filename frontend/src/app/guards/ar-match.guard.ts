import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const arMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isArUser()) {
    return true;
  }

  // If we return false, the router acts as if the route doesn't exist
  // and the chunk will not be loaded. 
  // We manually redirect to login page to handle unauthorized access gracefully.
  if (authService.isLoggedIn()) {
    router.navigate(['/login']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
