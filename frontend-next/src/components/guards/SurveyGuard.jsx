'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/lib/toast';

// Survey management pages: Superuser/Associate/Director (mapped to 'ar').
const ALLOWED_ROLES = ['ar', 'superuser', 'associate', 'director'];

export function SurveyGuard({ children }) {
  const { currentUser, ready } = useAuth();
  const router = useRouter();
  const notified = useRef(false);

  const allowed = !!currentUser && ALLOWED_ROLES.includes(currentUser.role);

  useEffect(() => {
    if (ready && !allowed && !notified.current) {
      notified.current = true;
      showToast({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this page.',
        life: 5000,
      });
      router.replace('/home');
    }
  }, [ready, allowed, router]);

  if (!ready || !allowed) {
    return null;
  }
  return <>{children}</>;
}
