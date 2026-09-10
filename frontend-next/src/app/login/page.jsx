'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = useAuth();
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const onLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const success = await auth.login(email, password);
      if (success) {
        router.push('/home');
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } catch (error) {
      // Network/server error is surfaced via the global toast (error interceptor)
      console.error('Login failed due to network/server error', error);
    }
  };

  const onForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <main className="login-page" role="main" aria-labelledby="member-login-heading">
      {/* Left Panel: Form */}
      <section className="login-left" aria-label="Sign in form">
        <div className="login-form-wrapper">
          {/* Vizor Logo */}
          <div className="login-logo">
            <img src="/assets/images/real.svg" alt="Vizor logo" className="vizor-logo-img" />
          </div>

          {/* Tagline */}
          <div className="login-tagline" aria-hidden="true">
            <span className="tagline-dark">decisions</span>
            <br />
            <span className="tagline-dark">start</span>
            <br />
            <span className="tagline-blue">here</span>
            <span className="tagline-blue-dot">.</span>
          </div>
          <span className="sr-only">Decisions start here.</span>

          {/* Member Login Heading */}
          <h2 className="member-login-heading" id="member-login-heading">
            Member Login
          </h2>

          {/* Login Form */}
          <form className="login-form" onSubmit={onLogin} noValidate aria-labelledby="member-login-heading">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="abc@xyz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : undefined}
                aria-describedby={errorMessage ? 'login-error-message' : undefined}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={errorMessage ? 'true' : undefined}
                  aria-describedby={errorMessage ? 'login-error-message' : undefined}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  aria-controls="login-password"
                >
                  {!showPassword && <i className="pi pi-eye-slash password-toggle-icon" aria-hidden="true"></i>}
                  {showPassword && <i className="pi pi-eye password-toggle-icon" aria-hidden="true"></i>}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password-row">
              <a
                href="javascript:void(0)"
                className="forgot-password-link"
                onClick={onForgotPassword}
                role="link"
                aria-label="Reset forgotten password"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div id="login-error-message" className="error-message" role="alert" aria-live="assertive" aria-atomic="true">
                {errorMessage}
              </div>
            )}

            {/* Login Button */}
            <button type="submit" className="login-btn" id="login-submit-btn" aria-label="Sign in to your account">
              Login
            </button>
          </form>
        </div>
      </section>

      {/* Right Panel: Hero Image */}
      <aside className="login-right" aria-hidden="true">
        <img src="/assets/images/login_banner.webp" alt="" className="login-hero-img" />
        {/* AR Logo (top-right) */}
        <div className="ar-logo-wrapper">
          <img src="/assets/images/ar__logo__right__top (1).svg" alt="" className="ar-logo-img" />
        </div>
      </aside>
    </main>
  );
}
