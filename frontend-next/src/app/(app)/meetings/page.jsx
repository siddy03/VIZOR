'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

export default function MeetingsPage() {
  return (
    <ArGuard>
      <PlaceholderPage heading="Meetings" text="Manage your meetings here." />
    </ArGuard>
  );
}
