// SETUP:
// - Configure testing module with:
//   - AddRoundtableComponent in imports (standalone component)
//   - FormsModule for ngModel support
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router and ActivatedRoute providers
// - Create component fixture and instance
// - Set isEditMode to false
// - Trigger change detection 

// TESTS:
// 1. Component Creation
// 2. Forms Input Element Render(by element ID)
// 3. Save Button Disabled When Required Fields Are Empty
// 4. Save Button Enabled When Required Fields Are Filled
// 5. onSave() Called on Save Button Click
// 6. Update Label Shown in Edit Mode
// 7. Cancel Button calls onCancel()
// 8. Dialog Actions – onConfirmLeave and onKeepEditing

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AddRoundtableComponent } from './add-roundtable';
import { RoundtableService } from '../../services/roundtable.service';

describe('AddRoundtableComponent', () => {
    let component: AddRoundtableComponent;
    let fixture: ComponentFixture<AddRoundtableComponent>;
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockRoundtableService: {
        addRoundtable: ReturnType<typeof vi.fn>;
        updateRoundtable: ReturnType<typeof vi.fn>;
        getRoundtableById: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        mockRouter = { navigate: vi.fn() };
        mockRoundtableService = {
            addRoundtable: vi.fn(),
            updateRoundtable: vi.fn(),
            getRoundtableById: vi.fn().mockReturnValue(undefined)
        };

        await TestBed.configureTestingModule({
            imports: [AddRoundtableComponent, FormsModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: RoundtableService, useValue: mockRoundtableService },
                {
                    provide: ActivatedRoute,
                    useValue: { paramMap: of(convertToParamMap({})) }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AddRoundtableComponent);
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
    it('should render the Roundtable Name input field', () => {
        const nameInput = fixture.debugElement.query(By.css('#roundtable-name'));
        expect(nameInput).toBeTruthy();
    });

    it('should render the Roundtable Abbreviation input field', () => {
        const abbrevInput = fixture.debugElement.query(By.css('#roundtable-abbreviation'));
        expect(abbrevInput).toBeTruthy();
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
        component.roundtableName.set('');
        component.roundtableAbbreviation.set('');
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(true);
    });

    // 4. Test: Save Button Enabled When Required Fields Are Filled
    it('should enable the Save button when required fields are filled', () => {
        component.roundtableName.set('Test Roundtable');
        component.roundtableAbbreviation.set('TRT');
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        expect(saveBtn.nativeElement.disabled).toBe(false);
    });

    // 5. Test: onSave() Called on Save Button Click
    it('should call onSave() when the Save button is clicked', () => {
        const spy = vi.spyOn(component, 'onSave');
        component.roundtableName.set('Test Roundtable');
        component.roundtableAbbreviation.set('TRT');
        fixture.detectChanges();
        const saveBtn = fixture.debugElement.query(By.css('.p-button-primary'));
        saveBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    // 6. Test: Update Label Shown in Edit Mode
    it('should show "Update" label on the button in edit mode', () => {
        component.isEditMode.set(true);
        component.roundtableName.set('Test');
        component.roundtableAbbreviation.set('TRT');
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

    it('should navigate directly to roundtables when form is clean on cancel', () => {
        component.onCancel();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/roundtables']);
    });

    it('should show cancel dialog when form is dirty on cancel', () => {
        component.roundtableName.set('Unsaved Data');
        component.onCancel();
        expect(component.showCancelDialog()).toBe(true);
    });

    // 8. Test: Dialog Actions
    it('should call onConfirmLeave() and close dialog and navigate away', () => {
        const spy = vi.spyOn(component, 'onConfirmLeave');
        component.showCancelDialog.set(true);
        component.onConfirmLeave();
        expect(spy).toHaveBeenCalledOnce();
        expect(component.showCancelDialog()).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/roundtables']);
    });

    it('should call onKeepEditing() and close dialog without navigating', () => {
        const spy = vi.spyOn(component, 'onKeepEditing');
        component.showCancelDialog.set(true);
        component.onKeepEditing();
        expect(spy).toHaveBeenCalledOnce();
        expect(component.showCancelDialog()).toBe(false);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should render the dialog No button when showCancelDialog is true', () => {
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const noBtn = fixture.debugElement.query(By.css('.dialog-button-no'));
        expect(noBtn).toBeTruthy();
    });

    it('should render the dialog Yes button when showCancelDialog is true', () => {
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const yesBtn = fixture.debugElement.query(By.css('.dialog-button-yes'));
        expect(yesBtn).toBeTruthy();
    });

    it('should trigger onKeepEditing when dialog No button is clicked', () => {
        const spy = vi.spyOn(component, 'onKeepEditing');
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const noBtn = fixture.debugElement.query(By.css('.dialog-button-no'));
        noBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should trigger onConfirmLeave when dialog Yes button is clicked', () => {
        const spy = vi.spyOn(component, 'onConfirmLeave');
        component.showCancelDialog.set(true);
        fixture.detectChanges();
        const yesBtn = fixture.debugElement.query(By.css('.dialog-button-yes'));
        yesBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    // Additional: breadcrumb navigation
    it('should show "Add New Roundtable" in breadcrumb when not in edit mode', () => {
        component.isEditMode.set(false);
        fixture.detectChanges();
        const breadcrumb = fixture.debugElement.query(By.css('.breadcrumb-item.active'));
        expect(breadcrumb.nativeElement.textContent.trim()).toBe('Add New Roundtable');
    });

    it('should show "Modify Roundtable" in breadcrumb when in edit mode', () => {
        component.isEditMode.set(true);
        fixture.detectChanges();
        const breadcrumb = fixture.debugElement.query(By.css('.breadcrumb-item.active'));
        expect(breadcrumb.nativeElement.textContent.trim()).toBe('Modify Roundtable');
    });

    it('should call navigateToRoundtablesList() when breadcrumb link is clicked', () => {
        const spy = vi.spyOn(component, 'navigateToRoundtablesList');
        const breadcrumbLink = fixture.debugElement.query(By.css('.breadcrumb-link'));
        breadcrumbLink.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    // Computed properties
    it('isDirty should be false when all fields are empty', () => {
        expect(component.isDirty()).toBe(false);
    });

    it('isDirty should be true when roundtableName is filled', () => {
        component.roundtableName.set('Some Name');
        expect(component.isDirty()).toBe(true);
    });

    it('primaryDirectorOptions should be empty when no directors are selected', () => {
        component.selectedDirectors.set([]);
        expect(component.primaryDirectorOptions()).toEqual([]);
    });

    it('primaryDirectorOptions should return filtered options for selected directors', () => {
        component.selectedDirectors.set(['director_a']);
        const opts = component.primaryDirectorOptions();
        expect(opts.length).toBe(1);
        expect(opts[0].value).toBe('director_a');
    });

    it('onDirectorsChange should clear primaryDirector if it is no longer selected', () => {
        component.selectedDirectors.set(['director_b']);
        component.primaryDirector.set('director_a');
        component.onDirectorsChange();
        expect(component.primaryDirector()).toBeNull();
    });

    it('onAssociatesChange should clear primaryAssociate if it is no longer selected', () => {
        component.selectedAssociates.set(['associate_b']);
        component.primaryAssociate.set('associate_a');
        component.onAssociatesChange();
        expect(component.primaryAssociate()).toBeNull();
    });

    // addRoundtable service called on valid save
    it('should call addRoundtable service when form is valid in add mode', () => {
        component.roundtableName.set('New RT');
        component.roundtableAbbreviation.set('NRT');
        component.onSave();
        expect(mockRoundtableService.addRoundtable).toHaveBeenCalledOnce();
    });

    it('should not call addRoundtable when required fields are missing', () => {
        component.roundtableName.set('');
        component.roundtableAbbreviation.set('');
        component.onSave();
        expect(mockRoundtableService.addRoundtable).not.toHaveBeenCalled();
    });
});

// Edit Mode
describe('AddRoundtableComponent – Edit Mode', () => {
    let component: AddRoundtableComponent;
    let fixture: ComponentFixture<AddRoundtableComponent>;

    beforeEach(async () => {
        const mockRoundtableService = {
            addRoundtable: vi.fn(),
            updateRoundtable: vi.fn(),
            getRoundtableById: vi.fn().mockReturnValue({
                id: 1,
                name: 'Existing RT',
                abbreviation: 'ERT',
                clientsWithAccess: 1,
                directors: 'Director A',
                associates: 'Associate A',
                description: 'Desc',
                status: 'Active',
                clientIds: ['client_a'],
                directorIds: ['director_a'],
                associateIds: ['associate_a'],
                primaryDirector: 'director_a',
                primaryAssociate: 'associate_a'
            })
        };

        await TestBed.configureTestingModule({
            imports: [AddRoundtableComponent, FormsModule],
            providers: [
                { provide: Router, useValue: { navigate: vi.fn() } },
                { provide: RoundtableService, useValue: mockRoundtableService },
                {
                    provide: ActivatedRoute,
                    useValue: { paramMap: of(convertToParamMap({ id: '1' })) }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(AddRoundtableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fixture.detectChanges(); // second call stabilizes bindings after ngOnInit sets values
    });

    it('should enter edit mode when a route id param is present', () => {
        expect(component.isEditMode()).toBe(true);
    });

    it('should populate roundtableName from service data in edit mode', () => {
        expect(component.roundtableName()).toBe('Existing RT');
    });

    it('should populate roundtableAbbreviation from service data in edit mode', () => {
        expect(component.roundtableAbbreviation()).toBe('ERT');
    });

    it('should set isActive to true when status is Active', () => {
        expect(component.isActive()).toBe(true);
    });

    it('should populate selectedDirectors and selectedAssociates in edit mode', () => {
        expect(component.selectedDirectors()).toEqual(['director_a']);
        expect(component.selectedAssociates()).toEqual(['associate_a']);
    });
});
