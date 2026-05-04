import { HttpInterceptorFn } from '@angular/common/http';

/**
 * JWT Interceptor
 * Automatically attaches the stored JWT token as a Bearer token
 * to all outgoing API requests (except login).
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip token for auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('vizor_token');

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
