'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

export default function AdminPage() {
  return (
    <ArGuard>
      <PlaceholderPage heading="Admin" text="Administrative settings and controls." />
    </ArGuard>
  );
}
