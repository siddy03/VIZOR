import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectAllProjects, selectProjectById } from '../store/project/project.selectors';
import * as ProjectActions from '../store/project/project.actions';
import { firstValueFrom } from 'rxjs';

export interface Project {
    id: number;
    name: string;
    abbreviation: string;
    clientsWithAccess: string;   // Comma-separated labels
    directors: string;           // Comma-separated labels
    associates: string;          // Comma-separated labels
    projectType: string;
    description: string;
    status: string;              // 'Active' or 'Inactive'

    // Raw selection data retained for edit mode
    clientIds?: any[];
    directorIds?: any[];
    associateIds?: any[];
    primaryDirector?: any;
    primaryAssociate?: any;
    selectedProjectType?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private store = inject(Store<AppState>);
    private http = inject(HttpClient);

    // Keep the readonly signal-like accessor via NgRx select
    readonly projects$ = this.store.select(selectAllProjects);

    /** Fetch all projects from backend and sync to NgRx store */
    async loadProjects(): Promise<void> {
        try {
            const projects = await firstValueFrom(
                this.http.get<Project[]>('/api/projects')
            );
            this.store.dispatch(ProjectActions.loadProjects({ projects }));
        } catch (error) {
            console.error('Failed to load projects from API', error);
        }
    }

    getProjects(): Project[] {
        let projects: Project[] = [];
        // Synchronous read from store
        this.store.select(selectAllProjects).subscribe(p => projects = p).unsubscribe();
        return projects;
    }

    async addProject(project: Project): Promise<void> {
        try {
            const created = await firstValueFrom(
                this.http.post<Project>('/api/projects', project)
            );
            this.store.dispatch(ProjectActions.addProject({ project: created }));
        } catch (error) {
            console.error('Failed to add project', error);
            // Fallback: still dispatch to local store
            this.store.dispatch(ProjectActions.addProject({ project }));
        }
    }

    getProjectById(id: number): Project | undefined {
        let project: Project | undefined;
        this.store.select(selectProjectById(id)).subscribe(p => project = p).unsubscribe();
        return project;
    }

    async updateProject(updatedProject: Project): Promise<void> {
        try {
            const saved = await firstValueFrom(
                this.http.put<Project>(`/api/projects/${updatedProject.id}`, updatedProject)
            );
            this.store.dispatch(ProjectActions.updateProject({ project: saved }));
        } catch (error) {
            console.error('Failed to update project', error);
            // Fallback: still dispatch to local store
            this.store.dispatch(ProjectActions.updateProject({ project: updatedProject }));
        }
    }
}
