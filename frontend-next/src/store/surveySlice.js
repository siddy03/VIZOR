import { createSlice } from '@reduxjs/toolkit';

function loadFromLocalStorage() {
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

const initialState = {
  surveys: loadFromLocalStorage(),
};

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    loadSurveys(state, action) {
      state.surveys = action.payload;
    },
    addSurvey(state, action) {
      const current = state.surveys;
      const newId = current.length > 0 ? Math.max(...current.map((s) => s.id)) + 1 : 1;
      state.surveys.push({ ...action.payload, id: newId });
    },
    updateSurvey(state, action) {
      const index = state.surveys.findIndex((s) => s.id === action.payload.id);
      if (index === -1) return;
      state.surveys[index] = action.payload;
    },
    deleteSurvey(state, action) {
      state.surveys = state.surveys.filter((s) => s.id !== action.payload);
    },
  },
});

export const { loadSurveys, addSurvey, updateSurvey, deleteSurvey } = surveySlice.actions;
export default surveySlice.reducer;
