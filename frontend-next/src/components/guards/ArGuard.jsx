'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Mirrors arGuard + arMatchGuard: only AR users may view; everyone else → /login.
export function ArGuard({ children }) {
  const { isLoggedIn, isArUser, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !(isLoggedIn && isArUser)) {
      router.replace('/login');
    }
  }, [ready, isLoggedIn, isArUser, router]);

  if (!ready || !(isLoggedIn && isArUser)) {
    return null;
  }
  return <>{children}</>;
}
