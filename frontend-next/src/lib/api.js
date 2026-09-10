import axios from 'axios';
import { showToast } from './toast';

// Single axios instance shared across all services (mirrors Angular's HttpClient).
// withCredentials => the browser sends/receives the HttpOnly auth cookies on every call.
export const api = axios.create({ withCredentials: true });

// --- Auth endpoint helpers -------------------------------------------------

// Endpoints that must NOT trigger an automatic token refresh on 401
// (otherwise /refresh failing would loop forever).
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

const isNoRefreshPath = (url = '') => NO_REFRESH_PATHS.some((p) => url.includes(p));
const isAuthPath = (url = '') => url.includes('/api/auth/');

// --- Single-flight refresh -------------------------------------------------
// Many requests can 401 at once when the access cookie expires. We refresh once
// and let every queued request await the same promise, then retry.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/api/auth/refresh')
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Response Interceptor (part 1) — transparent access-token refresh.
 * On a 401 from a protected endpoint, try /api/auth/refresh once, then replay
 * the original request. If refresh fails, broadcast a session-expired event so
 * the AuthProvider can clear state and route to /login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url ?? '';

    if (status === 401 && original && !original._retry && !isNoRefreshPath(url)) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vizor:session-expired'));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Debounce tracker to prevent toast flooding (ported from error.interceptor.ts)
let lastErrorMessage = '';
let lastErrorTimestamp = 0;

/**
 * Response Interceptor (part 2) — surfaces a PrimeReact toast for failed
 * requests, with the same debounce + messaging behaviour as the Angular version.
 * Auth endpoints are suppressed (login shows its own inline error; refresh/me
 * failures are an expected part of the session lifecycle).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    if (isAuthPath(url)) {
      return Promise.reject(error);
    }

    let errorMsg = 'An unknown error occurred!';
    const status = error.response?.status;

    if (error.response) {
      errorMsg = error.response.data?.message || `Server returned code: ${status}`;
    } else if (error.request) {
      errorMsg = `Network error: ${error.message}`;
    }

    // No response at all → network/offline error
    if (!error.response) {
      errorMsg = 'No internet connection or server is offline.';
    }

    const now = Date.now();
    if (errorMsg !== lastErrorMessage || now - lastErrorTimestamp > 5000) {
      lastErrorMessage = errorMsg;
      lastErrorTimestamp = now;
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000,
      });
    }

    return Promise.reject(error);
  }
);
