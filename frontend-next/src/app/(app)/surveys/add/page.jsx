'use client';

import { SurveyGuard } from '@/components/guards/SurveyGuard';
import AddSurveyForm from './AddSurveyForm';

export default function AddSurveyPage() {
  return (
    <SurveyGuard>
      <AddSurveyForm />
    </SurveyGuard>
  );
}
