import { createAction, props } from '@ngrx/store';
import { StoredSurvey } from '../../services/survey.service';

export const loadSurveys = createAction(
    '[Survey] Load Surveys',
    props<{ surveys: StoredSurvey[] }>()
);

export const addSurvey = createAction(
    '[Survey] Add Survey',
    props<{ survey: StoredSurvey }>()
);

export const updateSurvey = createAction(
    '[Survey] Update Survey',
    props<{ survey: StoredSurvey }>()
);
