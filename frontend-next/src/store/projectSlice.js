import { createSlice } from '@reduxjs/toolkit';

function loadFromLocalStorage() {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem('vizor_projects');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing projects from localStorage', e);
    }
  }
  return [];
}

const initialState = {
  projects: loadFromLocalStorage(),
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    loadProjects(state, action) {
      state.projects = action.payload;
    },
    addProject(state, action) {
      const current = state.projects;
      const newId = current.length > 0 ? Math.max(...current.map((p) => p.id)) + 1 : 1;
      state.projects.push({ ...action.payload, id: newId });
    },
    updateProject(state, action) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index === -1) return;
      state.projects[index] = action.payload;
    },
    deleteProject(state, action) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
  },
});

export const { loadProjects, addProject, updateProject, deleteProject } = projectSlice.actions;
export default projectSlice.reducer;
