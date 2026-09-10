'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function AuthGuard({ children }) {
  const { isLoggedIn, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/login');
    }
  }, [ready, isLoggedIn, router]);

  if (!ready || !isLoggedIn) {
    return null;
  }
  return <>{children}</>;
}
