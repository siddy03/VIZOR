import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

// Simple debounce tracker to prevent toast flooding
let lastErrorMessage = '';
let lastErrorTimestamp = 0;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMsg = `Network error: ${error.error.message}`;
      } else {
        // Backend API error
        errorMsg = error.error?.message || `Server returned code: ${error.status}`;
      }

      // If status is 0, it's definitively a network/offline error
      if (error.status === 0) {
        errorMsg = 'No internet connection or server is offline.';
      }

      const now = Date.now();
      if (errorMsg !== lastErrorMessage || (now - lastErrorTimestamp) > 5000) {
        lastErrorMessage = errorMsg;
        lastErrorTimestamp = now;

        // Trigger the PrimeNG Toast
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg,
          life: 5000 // Show toast for 5 seconds
        });
      }

      return throwError(() => error);
    })
  );
};
