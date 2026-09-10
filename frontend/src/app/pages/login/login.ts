import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    this.errorMessage = '';
    
    try {
      const success = await this.authService.login(this.email, this.password);
      
      if (success) {
        this.router.navigate(['/home']);
      } else {
        // This is a legitimate bad password / invalid email
        this.errorMessage = 'Invalid email or password.';
      }
    } catch (error) {
      // This means the Interceptor threw a network/server error
      // We don't set the local errorMessage so the user relies on the PrimeNG Toast
      console.error('Login failed due to network/server error', error);
    }
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // TODO: Implement forgot password navigation
  }
}
