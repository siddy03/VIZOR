import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SurveyState } from './survey.reducer';

export const selectSurveyState = createFeatureSelector<SurveyState>('survey');

export const selectAllSurveys = createSelector(
    selectSurveyState,
    (state) => state.surveys
);

export const selectSurveyById = (id: number) => createSelector(
    selectAllSurveys,
    (surveys) => surveys.find(s => s.id === id)
);
