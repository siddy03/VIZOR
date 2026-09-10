'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mirrors the Angular route: /community -> redirect to /community/discussion.
export default function CommunityIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/community/discussion');
  }, [router]);

  return null;
}
