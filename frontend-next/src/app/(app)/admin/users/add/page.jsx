'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddUserForm from './AddUserForm';

export default function AddUserPage() {
  return (
    <ArGuard>
      <AddUserForm />
    </ArGuard>
  );
}
