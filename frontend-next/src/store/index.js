import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './projectSlice';
import roundtableReducer from './roundtableSlice';
import surveyReducer from './surveySlice';
import layoutReducer from './layoutSlice';
import clientReducer from './clientSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    project: projectReducer,
    roundtable: roundtableReducer,
    survey: surveyReducer,
    layout: layoutReducer,
    client: clientReducer,
    user: userReducer,
  },
});

// Mirror of the NgRx localStorageSyncReducer meta-reducer:
// persist project / roundtable / survey / client collections on every change.
if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    try {
      localStorage.setItem('vizor_projects', JSON.stringify(state.project.projects));
      localStorage.setItem('vizor_roundtables', JSON.stringify(state.roundtable.roundtables));
      localStorage.setItem('vizor_surveys', JSON.stringify(state.survey.surveys));
      localStorage.setItem('vizor_clients', JSON.stringify(state.client.clients));
    } catch {
      /* ignore quota / serialization errors */
    }
  });
}
