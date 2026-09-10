'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddProjectForm from './AddProjectForm';

export default function AddProjectPage() {
  return (
    <ArGuard>
      <AddProjectForm />
    </ArGuard>
  );
}
