'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddClientForm from './AddClientForm';

export default function AddClientPage() {
  return (
    <ArGuard>
      <AddClientForm />
    </ArGuard>
  );
}
