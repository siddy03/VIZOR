import { ActionReducerMap, MetaReducer, ActionReducer } from '@ngrx/store';
import { ProjectState, projectReducer } from './project/project.reducer';
import { RoundtableState, roundtableReducer } from './roundtable/roundtable.reducer';
import { SurveyState, surveyReducer } from './survey/survey.reducer';
import { LayoutState, layoutReducer } from './layout/layout.reducer';
import { ClientState, clientReducer } from './client/client.reducer';

export interface AppState {
    project: ProjectState;
    roundtable: RoundtableState;
    survey: SurveyState;
    layout: LayoutState;
    client: ClientState;
}

export const reducers: ActionReducerMap<AppState> = {
    project: projectReducer,
    roundtable: roundtableReducer,
    survey: surveyReducer,
    layout: layoutReducer,
    client: clientReducer
};

// Meta-reducer to persist project and roundtable state to localStorage
export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
    return (state, action) => {
        const nextState = reducer(state, action);

        if (typeof localStorage !== 'undefined') {
            // Persist projects
            if (nextState && nextState.project) {
                localStorage.setItem('vizor_projects', JSON.stringify(nextState.project.projects));
            }

            // Persist roundtables
            if (nextState && nextState.roundtable) {
                localStorage.setItem('vizor_roundtables', JSON.stringify(nextState.roundtable.roundtables));
            }

            // Persist surveys
            if (nextState && nextState.survey) {
                localStorage.setItem('vizor_surveys', JSON.stringify(nextState.survey.surveys));
            }

            // Persist clients
            if (nextState && nextState.client) {
                localStorage.setItem('vizor_clients', JSON.stringify(nextState.client.clients));
            }
        }

        return nextState;
    };
}

export const metaReducers: MetaReducer<AppState>[] = [localStorageSyncReducer];
