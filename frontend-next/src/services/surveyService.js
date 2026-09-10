import { api } from '@/lib/api';
import { store } from '@/store';
import { showToast } from '@/lib/toast';
import {
  loadSurveys as loadSurveysAction,
  addSurvey as addSurveyAction,
  updateSurvey as updateSurveyAction,
  deleteSurvey as deleteSurveyAction,
} from '@/store/surveySlice';

export async function loadSurveys() {
  try {
    const { data } = await api.get('/api/surveys');
    store.dispatch(loadSurveysAction(data));
  } catch (error) {
    console.error('Failed to load surveys from API', error);
  }
}

export async function loadSurveyById(id) {
  try {
    const { data } = await api.get(`/api/surveys/${id}`);
    if (getSurveyById(id)) {
      store.dispatch(updateSurveyAction(data));
    } else {
      store.dispatch(addSurveyAction(data));
    }
    return data;
  } catch (error) {
    console.error(`Failed to load survey ${id} from API`, error);
    return undefined;
  }
}

export async function saveSurvey(
  payload,
  lastStep = 0,
  questionSections = [],
  participantSelections = [],
  notify = true
) {
  const storedSurvey = {
    ...payload,
    id: 0,
    lastStep,
    status: 'Draft',
    questionSections,
    participantSelections,
  };

  const { data: savedSurvey } = await api.post('/api/surveys', storedSurvey);
  store.dispatch(addSurveyAction(savedSurvey));
  if (notify) {
    showToast({
      severity: 'success',
      summary: 'Survey Saved',
      detail: `Survey "${savedSurvey.surveyName}" has been created successfully.`,
      life: 4000,
    });
  }
  return {
    id: savedSurvey.id,
    message: 'Survey created successfully',
    survey: savedSurvey,
  };
}

export async function updateSurvey(survey, notify = true) {
  const { data: savedSurvey } = await api.put(`/api/surveys/${survey.id}`, survey);
  store.dispatch(updateSurveyAction(savedSurvey));
  if (notify) {
    showToast({
      severity: 'success',
      summary: 'Survey Updated',
      detail: `Survey "${savedSurvey.surveyName}" has been updated successfully.`,
      life: 4000,
    });
  }
  return {
    id: savedSurvey.id,
    message: 'Survey updated successfully',
    survey: savedSurvey,
  };
}

export function getSurveys() {
  return store.getState().survey.surveys;
}

export function getSurveyById(id) {
  return store.getState().survey.surveys.find((s) => s.id === id);
}

export async function deleteSurvey(id) {
  try {
    await api.delete(`/api/surveys/${id}`);
    store.dispatch(deleteSurveyAction(id));
    return true;
  } catch (error) {
    console.error(`Failed to delete survey ${id}`, error);
    return false;
  }
}
