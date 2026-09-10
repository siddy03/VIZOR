'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SurveyGuard } from '@/components/guards/SurveyGuard';
import { useLayout } from '@/context/LayoutContext';
import AddSurveyForm from '../../add/AddSurveyForm';

export default function EditSurveyPage() {
  const params = useParams();
  const { setPageTitleOverride } = useLayout();
  const id = params?.id;

  useEffect(() => {
    setPageTitleOverride('Modify Survey');
  }, [setPageTitleOverride]);

  return (
    <SurveyGuard>
      <AddSurveyForm editId={id} />
    </SurveyGuard>
  );
}
