import { createReducer, on } from '@ngrx/store';
import { Project } from '../../services/project.service';
import * as ProjectActions from './project.actions';

export interface ProjectState {
    projects: Project[];
}

function loadFromLocalStorage(): Project[] {
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

export const initialState: ProjectState = {
    projects: loadFromLocalStorage()
};

export const projectReducer = createReducer(
    initialState,

    on(ProjectActions.loadProjects, (state, { projects }) => ({
        ...state,
        projects
    })),

    on(ProjectActions.addProject, (state, { project }) => {
        const current = state.projects;
        const newId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
        const newProject = { ...project, id: newId };
        return {
            ...state,
            projects: [...current, newProject]
        };
    }),

    on(ProjectActions.updateProject, (state, { project }) => {
        const index = state.projects.findIndex(p => p.id === project.id);
        if (index === -1) return state;
        const updated = [...state.projects];
        updated[index] = project;
        return {
            ...state,
            projects: updated
        };
    })
);
