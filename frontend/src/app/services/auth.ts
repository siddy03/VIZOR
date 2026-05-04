import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AppUser {
  email: string;
  password?: string;
  role: 'ar' | 'member';
  name: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: 'ar' | 'member';
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Reactive signals for auth state */
  isLoggedIn = signal(false);
  isArUser = signal(false);
  currentUser = signal<AppUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  /**
   * Attempts login against the Spring Boot backend.
   * Returns true on success, false on invalid credentials.
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>('/api/auth/login', { email, password })
      );

      if (response && response.token) {
        this.setSession(response);
        return true;
      }
      return false;
    } catch (error: any) {
      // 401 = invalid credentials → return false
      if (error?.status === 401) {
        return false;
      }
      // Any other error (network, server) → throw so interceptor toast shows
      throw error;
    }
  }

  /** Clears session and navigates to login page */
  logout(): void {
    localStorage.removeItem('vizor_user');
    localStorage.removeItem('vizor_token');
    this.isLoggedIn.set(false);
    this.isArUser.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Returns the stored JWT token */
  getToken(): string | null {
    return localStorage.getItem('vizor_token');
  }

  /** Stores user + token in localStorage and updates signals */
  private setSession(response: LoginResponse): void {
    const sessionUser: AppUser = {
      email: response.email,
      role: response.role,
      name: response.name
    };
    localStorage.setItem('vizor_user', JSON.stringify(sessionUser));
    localStorage.setItem('vizor_token', response.token);
    this.isLoggedIn.set(true);
    this.isArUser.set(response.role === 'ar');
    this.currentUser.set(sessionUser);
  }

  /** Restores session from localStorage on app startup */
  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('vizor_user');
      const token = localStorage.getItem('vizor_token');
      if (stored && token) {
        const user = JSON.parse(stored) as AppUser;
        this.isLoggedIn.set(true);
        this.isArUser.set(user.role === 'ar');
        this.currentUser.set(user);
      }
    } catch {
      localStorage.removeItem('vizor_user');
      localStorage.removeItem('vizor_token');
    }
  }
}