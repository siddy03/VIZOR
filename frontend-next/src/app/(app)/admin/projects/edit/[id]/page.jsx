'use client';

import { ArGuard } from '@/components/guards/ArGuard';
import AddProjectForm from '../../add/AddProjectForm';

export default function EditProjectPage() {
  return (
    <ArGuard>
      <AddProjectForm />
    </ArGuard>
  );
}
