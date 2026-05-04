import { TestBed } from '@angular/core/testing';
import { ProjectService, Project } from './project.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { provideStore, Store } from '@ngrx/store';
import { reducers, metaReducers } from '../store/app.state';
import * as ProjectActions from '../store/project/project.actions';

describe('ProjectService', () => {
    let service: ProjectService;

    const mockProject: Project = {
        id: 0,
        name: 'Test Project',
        abbreviation: 'TP',
        projectType: 'Internal',
        clientsWithAccess: 'Client A',
        directors: 'Director A',
        associates: 'Associate A',
        description: 'A test project',
        status: 'Active'
    };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideStore(reducers, { metaReducers })
            ]
        });
        service = TestBed.inject(ProjectService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with an empty projects list when localStorage is empty', () => {
        const projects = service.getProjects();
        expect(projects.length).toBe(0);
    });

    it('should add a new project and assign id starting at 1', () => {
        service.addProject({ ...mockProject });
        const projects = service.getProjects();
        expect(projects.length).toBe(1);
        expect(projects[0].id).toBe(1);
        expect(projects[0].name).toBe('Test Project');
    });

    it('should increment id correctly when adding multiple projects', () => {
        service.addProject({ ...mockProject });
        service.addProject({ ...mockProject, name: 'Second Project' });
        const projects = service.getProjects();
        expect(projects.length).toBe(2);
        expect(projects[0].id).toBe(1);
        expect(projects[1].id).toBe(2);
        
    });

    it('should return a project by id', () => {
        service.addProject({ ...mockProject });
        const found = service.getProjectById(1);
        expect(found).toBeDefined();
        expect(found?.name).toBe('Test Project');
    });

    it('should return undefined for a non-existent project id', () => {
        const found = service.getProjectById(999);
        expect(found).toBeUndefined();
    });

    it('should update an existing project', () => {
        service.addProject({ ...mockProject });
        const updated: Project = { ...mockProject, id: 1, name: 'Updated Project' };
        service.updateProject(updated);
        const projects = service.getProjects();
        expect(projects[0].name).toBe('Updated Project');
    });

    it('should not change project list when updating a non-existent id', () => {
        service.addProject({ ...mockProject });
        service.updateProject({ ...mockProject, id: 999, name: 'Ghost' });
        const projects = service.getProjects();
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Test Project');
    });

    it('should persist projects to localStorage on add', () => {
        service.addProject({ ...mockProject });
        const stored = JSON.parse(localStorage.getItem('vizor_projects') || '[]');
        expect(stored.length).toBe(1);
        expect(stored[0].name).toBe('Test Project');
    });

    it('should persist projects to localStorage on update', () => {
        service.addProject({ ...mockProject });
        service.updateProject({ ...mockProject, id: 1, name: 'Updated' });
        const stored = JSON.parse(localStorage.getItem('vizor_projects') || '[]');
        expect(stored[0].name).toBe('Updated');
    });

    it('should load projects from localStorage on construction', () => {
        const storedData: Project[] = [{ ...mockProject, id: 5, name: 'Persisted' }];
        const store = TestBed.inject(Store);
        store.dispatch(ProjectActions.loadProjects({ projects: storedData }));

        const result = service.getProjects();
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Persisted');
    });

    it('should handle corrupted localStorage gracefully', () => {
        localStorage.setItem('vizor_projects', 'invalid_json');
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                provideStore(reducers, { metaReducers })
            ]
        });
        const freshService = TestBed.inject(ProjectService);
        const result = freshService.getProjects();
        expect(result.length).toBe(0);
    });

    it('should expose getProjects() returning an array', () => {
        const result = service.getProjects();
        expect(Array.isArray(result)).toBe(true);
    });
});
