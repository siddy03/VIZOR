'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isArUser, setIsArUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  const applySession = useCallback((user) => {
    setIsLoggedIn(true);
    setIsArUser(user.role === 'ar');
    setCurrentUser({ email: user.email, role: user.role, name: user.name });
  }, []);

  const clearSession = useCallback(() => {
    setIsLoggedIn(false);
    setIsArUser(false);
    setCurrentUser(null);
  }, []);

  // restoreSession() — on startup, ask the backend who we are. The HttpOnly
  // cookie is invisible to JS, so the server is the source of truth. If the
  // access cookie is expired the api interceptor will transparently refresh.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (!cancelled && data?.email) {
          applySession(data);
        }
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  // If a refresh ultimately fails mid-session, the api layer fires this event.
  useEffect(() => {
    const onExpired = () => {
      clearSession();
      router.replace('/login');
    };
    window.addEventListener('vizor:session-expired', onExpired);
    return () => window.removeEventListener('vizor:session-expired', onExpired);
  }, [clearSession, router]);

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await api.post('/api/auth/login', { email, password });
        if (response.data && response.data.email) {
          applySession(response.data);
          return true;
        }
        return false;
      } catch (error) {
        if (error?.response?.status === 401) {
          return false;
        }
        throw error;
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Even if the server call fails, clear client state and redirect.
    }
    clearSession();
    router.push('/login');
  }, [clearSession, router]);

  const value = {
    isLoggedIn,
    isArUser,
    currentUser,
    ready,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
