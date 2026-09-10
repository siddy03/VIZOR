'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddClientForm from '../../add/AddClientForm';

export default function EditClientPage() {
  return (
    <ArGuard>
      <AddClientForm />
    </ArGuard>
  );
}
