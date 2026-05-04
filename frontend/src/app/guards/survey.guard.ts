import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { MessageService } from 'primeng/api';

/**
 * Restricts access to survey management pages.
 * Allowed roles: Superuser, Associate, Director (mapped to 'ar' in current auth system).
 */
const ALLOWED_ROLES = ['ar', 'superuser', 'associate', 'director'];

export const surveyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const user = authService.currentUser();

  if (user && ALLOWED_ROLES.includes(user.role)) {
    return true;
  }

  messageService.add({
    severity: 'error',
    summary: 'Access Denied',
    detail: 'You do not have permission to access this page.',
    life: 5000
  });

  return router.createUrlTree(['/home']);
};
