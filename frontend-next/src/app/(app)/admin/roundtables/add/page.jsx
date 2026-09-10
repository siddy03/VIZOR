'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddRoundtableForm from './AddRoundtableForm';

export default function AddRoundtablePage() {
  return (
    <ArGuard>
      <AddRoundtableForm />
    </ArGuard>
  );
}
