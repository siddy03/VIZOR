// SETUP:
// - Configure testing module with:
//   - ProjectsComponent in imports (standalone component)
//   - FormsModule for ngModel support
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router and ProjectService providers
// - Create component fixture and instance
// - Trigger change detection

// TESTS:
// 1. Component Creation
// 2. Renders filter bar elements (project type, status, search)
// 3. Renders Add New Project button
// 4. "Add New Project" button calls addNewProject()
// 5. Filter by project type using computed filteredProjects
// 6. Filter by status using computed filteredProjects
// 7. Search filtering using searchTerm signal
// 8. Combined filter (type + status + search)
// 9. editProject() called on table row action
// 10. Filter options initialized correctly

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProjectsComponent } from './projects';
import { ProjectService, Project } from '../../services/project.service';

describe('ProjectsComponent', () => {
    let component: ProjectsComponent;
    let fixture: ComponentFixture<ProjectsComponent>;
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockProjectService: { getProjects: ReturnType<typeof vi.fn> };

    const sampleProjects: Project[] = [
        {
            id: 1, name: 'Alpha Project', abbreviation: 'AP',
            projectType: 'Internal', clientsWithAccess: 'Client A',
            directors: 'Director A', associates: 'Associate A',
            description: 'First', status: 'Active'
        },
        {
            id: 2, name: 'Beta Project', abbreviation: 'BP',
            projectType: 'External', clientsWithAccess: 'Client B',
            directors: 'Director B', associates: 'Associate B',
            description: 'Second', status: 'Inactive'
        },
        {
            id: 3, name: 'Gamma Research', abbreviation: 'GR',
            projectType: 'Research', clientsWithAccess: 'Client C',
            directors: 'Director C', associates: 'Associate C',
            description: 'Third', status: 'Active'
        }
    ];

    beforeEach(async () => {
        mockRouter = { navigate: vi.fn() };
        mockProjectService = { getProjects: vi.fn().mockReturnValue(sampleProjects) };

        await TestBed.configureTestingModule({
            imports: [ProjectsComponent, FormsModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ProjectService, useValue: mockProjectService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // 1. Component Creation
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    // 2. Renders filter bar elements
    it('should render the filter bar', () => {
        const filterBar = fixture.debugElement.query(By.css('.filter-bar'));
        expect(filterBar).toBeTruthy();
    });

    it('should render the search input', () => {
        const searchInput = fixture.debugElement.query(By.css('input[placeholder="Search"]'));
        expect(searchInput).toBeTruthy();
    });

    it('should render the search button', () => {
        const searchBtn = fixture.debugElement.query(By.css('.search-btn'));
        expect(searchBtn).toBeTruthy();
    });

    // 3. Renders Add New Project button
    it('should render the Add New Project button', () => {
        const addBtn = fixture.debugElement.query(By.css('.add-btn-custom'));
        expect(addBtn).toBeTruthy();
    });

    // 4. Add New Project button calls addNewProject()
    it('should call addNewProject() when Add New Project button is clicked', () => {
        const spy = vi.spyOn(component, 'addNewProject');
        const addBtn = fixture.debugElement.query(By.css('.add-btn-custom'));
        addBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should navigate to /admin/projects/add when addNewProject() is called', () => {
        component.addNewProject();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects/add']);
    });

    // 5. Loads and shows all projects on init
    it('should load all projects on init', () => {
        expect(component.filteredProjects().length).toBe(3);
    });

    it('should show all projects in filteredProjects by default', () => {
        expect(component.filteredProjects().length).toBe(3);
    });

    // Filter by project type
    it('should filter by Internal project type', () => {
        component.selectedProjectType.set({ label: 'Internal', value: 'Internal' });
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Alpha Project');
    });

    it('should filter by External project type', () => {
        component.selectedProjectType.set({ label: 'External', value: 'External' });
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Beta Project');
    });

    it('should filter by Research project type', () => {
        component.selectedProjectType.set({ label: 'Research', value: 'Research' });
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Gamma Research');
    });

    it('should show all projects when type filter is "All"', () => {
        component.selectedProjectType.set({ label: 'All', value: 'All' });
        expect(component.filteredProjects().length).toBe(3);
    });

    // 6. Filter by status
    it('should filter by Active status', () => {
        component.selectedStatus.set({ label: 'Active', value: 'Active' });
        expect(component.filteredProjects().length).toBe(2);
        expect(component.filteredProjects().every(p => p.status === 'Active')).toBe(true);
    });

    it('should filter by Inactive status', () => {
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Beta Project');
    });

    it('should show all when status filter is "All"', () => {
        component.selectedProjectType.set({ label: 'All', value: 'All' });
        component.selectedStatus.set({ label: 'All', value: 'All' });
        expect(component.filteredProjects().length).toBe(3);
    });

    // 7. Search filtering
    it('should filter by name using searchTerm', () => {
        component.searchTerm.set('alpha');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Alpha Project');
    });

    it('should filter by director using searchTerm', () => {
        component.searchTerm.set('Director B');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].abbreviation).toBe('BP');
    });

    it('should filter by associate using searchTerm', () => {
        component.searchTerm.set('Associate C');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].abbreviation).toBe('GR');
    });

    it('should filter by client using searchTerm', () => {
        component.searchTerm.set('Client B');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].abbreviation).toBe('BP');
    });

    it('should be case-insensitive in search', () => {
        component.searchTerm.set('GAMMA');
        expect(component.filteredProjects().length).toBe(1);
    });

    it('should return no results when searchTerm matches nothing', () => {
        component.searchTerm.set('XYZNoMatch');
        expect(component.filteredProjects().length).toBe(0);
    });

    it('should ignore whitespace-only searchTerm', () => {
        component.searchTerm.set('   ');
        expect(component.filteredProjects().length).toBe(3);
    });

    // 8. Combined filters
    it('should apply both type filter and search together', () => {
        component.selectedProjectType.set({ label: 'Internal', value: 'Internal' });
        component.searchTerm.set('Alpha');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Alpha Project');
    });

    it('should apply status filter and search together', () => {
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        component.searchTerm.set('Beta');
        expect(component.filteredProjects().length).toBe(1);
        expect(component.filteredProjects()[0].name).toBe('Beta Project');
    });

    it('should return no results when combined filters do not match', () => {
        component.selectedProjectType.set({ label: 'Internal', value: 'Internal' });
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        expect(component.filteredProjects().length).toBe(0);
    });

    // 9. editProject() called on table row action
    it('should call editProject() with the correct project', () => {
        const spy = vi.spyOn(component, 'editProject');
        component.editProject(sampleProjects[0]);
        expect(spy).toHaveBeenCalledWith(sampleProjects[0]);
    });

    it('should navigate to edit route with project id when editProject() is called', () => {
        component.editProject(sampleProjects[0]);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects/edit', 1]);
    });

    it('should navigate with the correct id for second project', () => {
        component.editProject(sampleProjects[1]);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects/edit', 2]);
    });

    // 10. Filter options initialized correctly
    it('should initialize projectTypeOptions with All, Internal, External, Research', () => {
        const values = component.projectTypeOptions.map(o => o.value);
        expect(values).toContain('All');
        expect(values).toContain('Internal');
        expect(values).toContain('External');
        expect(values).toContain('Research');
    });

    it('should initialize statusOptions with All, Active, Inactive', () => {
        const values = component.statusOptions.map(o => o.value);
        expect(values).toContain('All');
        expect(values).toContain('Active');
        expect(values).toContain('Inactive');
    });
});
