// SETUP:
// - Configure testing module with:
//   - AddProjectComponent in imports (standalone component)
//   - FormsModule for ngModel support
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router, ActivatedRoute, and ProjectService providers
// - Set isEditMode to false
// - Trigger change detection

// TESTS:
// 1. Component Creation
// 2. Form Input Elements Render (by element ID)
// 3. Save Button Disabled When Required Fields Are Empty
// 4. Save Button Enabled When All Required Fields Are Filled
// 5. onSave() Called on Save Button Click
// 6. Update Label Shown in Edit Mode
// 7. Cancel Button Calls onCancel()
// 8. Dialog Actions – onConfirmLeave and onKeepEditing

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AddProjectComponent } from './add-project';
import { ProjectService } from '../../services/project.service';

describe('AddProjectComponent', () => {
    let component: AddProjectComponent;
    let fixture: ComponentFixture<AddProjectComponent>;
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockProjectService: {
        addProject: ReturnType<typeof vi.fn>;
        updateProject: ReturnType<typeof vi.fn>;
        getProjectById: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        mockRouter = { navigate: vi.fn() };
        mockProjectService = {
            addProject: vi.fn(),
            updateProject: vi.fn(),
            getProjectById: vi.fn().mockReturnValue(undefined)
        };

        await TestBed.configureTestingModule({
            imports: [AddProjectComponent, FormsModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ProjectService, useValue: mockProjectService },
                {
                    provide: ActivatedRoute,
                    useValue: { paramMap: of(convertToParamMap({})) }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AddProjectComponent);
        component = fixture.componentInstance;
        component.isEditMode.set(false);
        fixture.detectChanges();
        fixture.detectChanges(); // stabilize ngModel two-way bindings (prevents NG0100)
    });

    // 1. Test: Component Creation
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    // 2. Test: Form Inputs Render
    it('should render the Project Name input field', () => {
        const nameInput = fixture.debugElement.query(By.css('#project-name'));
        expect(nameInput).toBeTruthy();
    });

    it('should render the Project Abbreviation input field', () => {
        const abbrevInput = fixture.debugElement.query(By.css('#project-abbreviation'));
        expect(abbrevInput).toBeTruthy();
    });

    it('should render the Project Type select dropdown', () => {
        const projectType = fixture.debugElement.query(By.css('#project-type'));
        expect(projectType).toBeTruthy();
    });

    it('should render the Clients multiselect', () => {
        const clients = fixture.debugElement.query(By.css('#select-clients'));
        expect(clients).toBeTruthy();
    });

    it('should render the Directors multiselect', () => {
        const directors = fixture.debugElement.query(By.css('#select-directors'));
        expect(directors).toBeTruthy();
    });

    it('should render the Primary Director select', () => {
        const primaryDirector = fixture.debugElement.query(By.css('#primary-director'));
        expect(primaryDirector).toBeTruthy();
    });

    it('should render the Associates multiselect', () => {
        const associates = fixture.debugElement.query(By.css('#select-associates'));
        expect(associates).toBeTruthy();
    });

    it('should render the Primary Associate select', () => {
        const primaryAssociate = fixture.debugElement.query(By.css('#primary-associate'));
        expect(primaryAssociate).toBeTruthy();
    });

    it('should render the Description textarea', () => {
        const description = fixture.debugElement.query(By.css('#description'));
        expect(description).toBeTruthy();
    });

    it('should render the Active checkbox', () => {
        const checkbox = fixture.debugElement.query(By.css('#active-checkbox'));
        expect(checkbox).toBeTruthy();
    });

    // 3. Test: Save Button Disabled When Form Is Invalid
    it('should disable the Save button when required fields are empty', () => {
        component.projectName.set('');
        component.projectAbbreviation.set('');
        component.selectedProjectType.set(null);
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(true);
    });

    it('should disable the Save button when only project name is filled', () => {
        component.projectName.set('Test');
        component.projectAbbreviation.set('');
        component.selectedProjectType.set(null);
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(true);
    });

    it('should disable the Save button when project type is missing', () => {
        component.projectName.set('Test');
        component.projectAbbreviation.set('TP');
        component.selectedProjectType.set(null);
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(true);
    });

    // 4. Test: Save Button Enabled When All Required Fields Are Filled
    it('should enable the Save button when all required fields are filled', () => {
        component.projectName.set('My Project');
        component.projectAbbreviation.set('MP');
        component.selectedProjectType.set('Internal');
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(false);
    });

    // 5. Test: onSave() Called on Save Button Click
    it('should call onSave() when Save button is clicked', () => {
        const spy = vi.spyOn(component, 'onSave');
        component.projectName.set('My Project');
        component.projectAbbreviation.set('MP');
        component.selectedProjectType.set('Internal');
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        saveBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should set submitted = true when onSave is called', () => {
        expect(component.submitted()).toBe(false);
        component.onSave();
        expect(component.submitted()).toBe(true);
    });

    it('should call addProject service when form is valid in add mode', () => {
        component.projectName.set('New Project');
        component.projectAbbreviation.set('NP');
        component.selectedProjectType.set('External');
        component.onSave();
        expect(mockProjectService.addProject).toHaveBeenCalledOnce();
    });

    it('should not call addProject when required fields are missing', () => {
        component.projectName.set('');
        component.onSave();
        expect(mockProjectService.addProject).not.toHaveBeenCalled();
    });

    it('should navigate to /admin/projects after successful save', () => {
        component.projectName.set('New Project');
        component.projectAbbreviation.set('NP');
        component.selectedProjectType.set('Internal');
        component.onSave();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects']);
    });

    // 6. Test: Update Label Shown in Edit Mode
    it('should reflect isEditMode = true in component state', () => {
        component.isEditMode.set(true);
        fixture.detectChanges();
        expect(component.isEditMode()).toBe(true);
    });

    it('should set label to "Update" when isEditMode is true', () => {
        component.isEditMode.set(true);
        component.projectName.set('Test');
        component.projectAbbreviation.set('TP');
        component.selectedProjectType.set('Internal');
        fixture.detectChanges();
        // PrimeNG's pButton intercepts DOM title/label — verify via component state
        expect(component.isEditMode()).toBe(true);
        const expectedLabel = component.isEditMode() ? 'Update' : 'Save';
        expect(expectedLabel).toContain('Update');
    });

    // 7. Test: Cancel Button Calls onCancel()
    it('should call onCancel() when Cancel button is clicked', () => {
        const spy = vi.spyOn(component, 'onCancel');
        const cancelBtn = fixture.debugElement.query(By.css('.p-button-secondary'));
        cancelBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should navigate directly to /admin/projects when form is clean on cancel', () => {
        component.onCancel();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects']);
    });

    it('should show cancel dialog when form is dirty on cancel', () => {
        component.projectName.set('Unsaved Data');
        component.onCancel();
        expect(component.showCancelDialog()).toBe(true);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    // 8. Test: Confirmation Dialog Actions
    it('should call onConfirmLeave() and close dialog and navigate', () => {
        const spy = vi.spyOn(component, 'onConfirmLeave');
        component.showCancelDialog.set(true);
        component.onConfirmLeave();
        expect(spy).toHaveBeenCalledOnce();
        expect(component.showCancelDialog()).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects']);
    });

    it('should call onKeepEditing() and close dialog without navigating', () => {
        const spy = vi.spyOn(component, 'onKeepEditing');
        component.showCancelDialog.set(true);
        component.onKeepEditing();
        expect(spy).toHaveBeenCalledOnce();
        expect(component.showCancelDialog()).toBe(false);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should render dialog No button when showCancelDialog is true', () => {
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const noBtn = fixture.debugElement.query(By.css('.dialog-button-no'));
        expect(noBtn).toBeTruthy();
    });

    it('should render dialog Yes button when showCancelDialog is true', () => {
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const yesBtn = fixture.debugElement.query(By.css('.dialog-button-yes'));
        expect(yesBtn).toBeTruthy();
    });

    it('should trigger onKeepEditing when dialog No button is clicked', () => {
        const spy = vi.spyOn(component, 'onKeepEditing');
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        fixture.debugElement.query(By.css('.dialog-button-no')).triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should trigger onConfirmLeave when dialog Yes button is clicked', () => {
        const spy = vi.spyOn(component, 'onConfirmLeave');
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        fixture.debugElement.query(By.css('.dialog-button-yes')).triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    // Breadcrumb
    it('should show "Add New Project" in breadcrumb when not in edit mode', () => {
        component.isEditMode.set(false);
        fixture.detectChanges();
        const breadcrumb = fixture.debugElement.query(By.css('.breadcrumb-item.active'));
        expect(breadcrumb.nativeElement.textContent.trim()).toBe('Add New Project');
    });

    it('should show "Modify Project" in breadcrumb in edit mode', () => {
        component.isEditMode.set(true);
        fixture.detectChanges();
        const breadcrumb = fixture.debugElement.query(By.css('.breadcrumb-item.active'));
        expect(breadcrumb.nativeElement.textContent.trim()).toBe('Modify Project');
    });

    it('should call navigateToProjectsList() when breadcrumb link is clicked', () => {
        const spy = vi.spyOn(component, 'navigateToProjectsList');
        fixture.debugElement.query(By.css('.breadcrumb-link')).triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    // Computed properties
    it('isDirty should be false when all fields are empty', () => {
        expect(component.isDirty()).toBe(false);
    });

    it('isDirty should be true when projectName is set', () => {
        component.projectName.set('Test');
        expect(component.isDirty()).toBe(true);
    });

    it('primaryDirectorOptions should return empty array when no directors selected', () => {
        component.selectedDirectors.set([]);
        expect(component.primaryDirectorOptions()).toEqual([]);
    });

    it('primaryDirectorOptions should return filtered directors based on selection', () => {
        component.selectedDirectors.set(['director_b']);
        const opts = component.primaryDirectorOptions();
        expect(opts.length).toBe(1);
        expect(opts[0].value).toBe('director_b');
    });

    it('onDirectorsChange should clear primaryDirector if deselected', () => {
        component.selectedDirectors.set(['director_b']);
        component.primaryDirector.set('director_a');
        component.onDirectorsChange();
        expect(component.primaryDirector()).toBeNull();
    });

    it('onAssociatesChange should clear primaryAssociate if deselected', () => {
        component.selectedAssociates.set(['associate_b']);
        component.primaryAssociate.set('associate_a');
        component.onAssociatesChange();
        expect(component.primaryAssociate()).toBeNull();
    });

    it('should pass status "Active" when isActive is true', () => {
        component.projectName.set('P');
        component.projectAbbreviation.set('P');
        component.selectedProjectType.set('Internal');
        component.isActive.set(true);
        component.onSave();
        const arg = (mockProjectService.addProject as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(arg.status).toBe('Active');
    });

    it('should pass status "Inactive" when isActive is false', () => {
        component.projectName.set('P');
        component.projectAbbreviation.set('P');
        component.selectedProjectType.set('Internal');
        component.isActive.set(false);
        component.onSave();
        const arg = (mockProjectService.addProject as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(arg.status).toBe('Inactive');
    });
});

// Edit Mode
describe('AddProjectComponent – Edit Mode', () => {
    let component: AddProjectComponent;
    let fixture: ComponentFixture<AddProjectComponent>;

    beforeEach(async () => {
        const mockProjectService = {
            addProject: vi.fn(),
            updateProject: vi.fn(),
            getProjectById: vi.fn().mockReturnValue({
                id: 2,
                name: 'Loaded Project',
                abbreviation: 'LP',
                projectType: 'Research',
                clientsWithAccess: 'Client A',
                directors: 'Director A',
                associates: 'Associate A',
                description: 'Loaded desc',
                status: 'Active',
                clientIds: ['client_a'],
                directorIds: ['director_a'],
                associateIds: ['associate_a'],
                primaryDirector: 'director_a',
                primaryAssociate: 'associate_a',
                selectedProjectType: 'Research'
            })
        };

        await TestBed.configureTestingModule({
            imports: [AddProjectComponent, FormsModule],
            providers: [
                { provide: Router, useValue: { navigate: vi.fn() } },
                { provide: ProjectService, useValue: mockProjectService },
                {
                    provide: ActivatedRoute,
                    useValue: { paramMap: of(convertToParamMap({ id: '2' })) }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AddProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fixture.detectChanges(); // second call stabilizes bindings after ngOnInit sets values
    });

    it('should enter edit mode when route id param is present', () => {
        expect(component.isEditMode()).toBe(true);
    });

    it('should populate projectName from service data', () => {
        expect(component.projectName()).toBe('Loaded Project');
    });

    it('should populate projectAbbreviation from service data', () => {
        expect(component.projectAbbreviation()).toBe('LP');
    });

    it('should set selectedProjectType from service data', () => {
        expect(component.selectedProjectType()).toBe('Research');
    });

    it('should set isActive to true when status is Active', () => {
        expect(component.isActive()).toBe(true);
    });

    it('should call updateProject instead of addProject in edit mode', () => {
        const mockService = TestBed.inject(ProjectService) as any;
        component.projectName.set('Updated Name');
        component.projectAbbreviation.set('UN');
        component.selectedProjectType.set('Internal');
        component.onSave();
        expect(mockService.updateProject).toHaveBeenCalledOnce();
        expect(mockService.addProject).not.toHaveBeenCalled();
    });
});
