'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';

export default function ExchangePage() {
  return (
    <ArGuard>
      <PlaceholderPage heading="Auriemma Exchange" text="Manage your Auriemma Exchange activities here." />
    </ArGuard>
  );
}
