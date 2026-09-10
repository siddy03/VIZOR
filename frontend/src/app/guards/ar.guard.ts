import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const arGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isArUser()) {
    return true;
  }

  // If logged in but not AR, redirect to login
  if (authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Not logged in at all
  router.navigate(['/login']);
  return false;
};
