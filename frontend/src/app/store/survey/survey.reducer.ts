import { createReducer, on } from '@ngrx/store';
import { StoredSurvey } from '../../services/survey.service';
import * as SurveyActions from './survey.actions';

export interface SurveyState {
    surveys: StoredSurvey[];
}

function loadFromLocalStorage(): StoredSurvey[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem('vizor_surveys');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing surveys from localStorage', e);
        }
    }
    return [];
}

export const initialState: SurveyState = {
    surveys: loadFromLocalStorage()
};

export const surveyReducer = createReducer(
    initialState,

    on(SurveyActions.loadSurveys, (state, { surveys }) => ({
        ...state,
        surveys
    })),

    on(SurveyActions.addSurvey, (state, { survey }) => {
        const current = state.surveys;
        const newId = current.length > 0 ? Math.max(...current.map(s => s.id)) + 1 : 1;
        const newSurvey = { ...survey, id: newId };
        return {
            ...state,
            surveys: [...current, newSurvey]
        };
    }),

    on(SurveyActions.updateSurvey, (state, { survey }) => {
        const index = state.surveys.findIndex(s => s.id === survey.id);
        if (index === -1) return state;
        const updated = [...state.surveys];
        updated[index] = survey;
        return {
            ...state,
            surveys: updated
        };
    })
);
