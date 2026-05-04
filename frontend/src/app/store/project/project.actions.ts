import { createAction, props } from '@ngrx/store';
import { Project } from '../../services/project.service';

export const loadProjects = createAction(
    '[Project] Load Projects',
    props<{ projects: Project[] }>()
);

export const addProject = createAction(
    '[Project] Add Project',
    props<{ project: Project }>()
);

export const updateProject = createAction(
    '[Project] Update Project',
    props<{ project: Project }>()
);
