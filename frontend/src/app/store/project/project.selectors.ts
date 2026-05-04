import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>('project');

export const selectAllProjects = createSelector(
    selectProjectState,
    (state) => state.projects
);

export const selectProjectById = (id: number) => createSelector(
    selectAllProjects,
    (projects) => projects.find(p => p.id === id)
);
