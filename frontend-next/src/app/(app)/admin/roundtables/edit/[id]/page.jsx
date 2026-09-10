'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddRoundtableForm from '../../add/AddRoundtableForm';

export default function EditRoundtablePage() {
  return (
    <ArGuard>
      <AddRoundtableForm />
    </ArGuard>
  );
}
