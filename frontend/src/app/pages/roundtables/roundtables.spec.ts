// SETUP:
// - Configure testing module with:
//   - RoundtablesComponent in imports (standalone component)
//   - FormsModule for ngModel support
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router and RoundtableService providers
// - Create component fixture and instance
// - Trigger change detection

// TESTS:
// 1. Component Creation
// 2. Renders filter bar elements (status, search)
// 3. Renders Add New Roundtable button
// 4. "Add New Roundtable" button calls addNewRoundtable()
// 5. Status filter using signal-based computed filteredRoundtables
// 6. Search filtering using searchText signal
// 7. Combined filter (status + search)
// 8. editRoundtable() navigates with correct id
// 9. Filter options initialized correctly

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RoundtablesComponent } from './roundtables';
import { RoundtableService, Roundtable } from '../../services/roundtable.service';

describe('RoundtablesComponent', () => {
    let component: RoundtablesComponent;
    let fixture: ComponentFixture<RoundtablesComponent>;
    let mockRouter: { navigate: ReturnType<typeof vi.fn> };
    let mockRoundtableService: { getRoundtables: ReturnType<typeof vi.fn> };

    const sampleRoundtables: Roundtable[] = [
        {
            id: 1, name: 'Roundtable Alpha', abbreviation: 'RA',
            clientsWithAccess: 3, directors: 'Director A',
            associates: 'Associate A', description: 'First RT', status: 'Active'
        },
        {
            id: 2, name: 'Roundtable Beta', abbreviation: 'RB',
            clientsWithAccess: 1, directors: 'Director B',
            associates: 'Associate B', description: 'Second RT', status: 'Inactive'
        },
        {
            id: 3, name: 'Roundtable Gamma', abbreviation: 'RG',
            clientsWithAccess: 2, directors: 'Director A',
            associates: 'Associate C', description: 'Third RT', status: 'Active'
        }
    ];

    beforeEach(async () => {
        mockRouter = { navigate: vi.fn() };
        mockRoundtableService = { getRoundtables: vi.fn().mockReturnValue(sampleRoundtables) };

        await TestBed.configureTestingModule({
            imports: [RoundtablesComponent, FormsModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: RoundtableService, useValue: mockRoundtableService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(RoundtablesComponent);
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

    // 3. Renders Add New Roundtable button
    it('should render the Add New Roundtable button', () => {
        const addBtn = fixture.debugElement.query(By.css('.add-btn-custom'));
        expect(addBtn).toBeTruthy();
    });

    // 4. Add New Roundtable button calls addNewRoundtable()
    it('should call addNewRoundtable() when Add New Roundtable button is clicked', () => {
        const spy = vi.spyOn(component, 'addNewRoundtable');
        const addBtn = fixture.debugElement.query(By.css('.add-btn-custom'));
        addBtn.triggerEventHandler('click', {});
        expect(spy).toHaveBeenCalledOnce();
    });

    it('should navigate to /admin/roundtables/add when addNewRoundtable() is called', () => {
        component.addNewRoundtable();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/roundtables/add']);
    });

    // Loads data on init
    it('should load all roundtables on ngOnInit', () => {
        expect(component.filteredRoundtables().length).toBe(3);
    });

    it('should show all roundtables in filteredRoundtables by default', () => {
        expect(component.filteredRoundtables().length).toBe(3);
    });

    // 5. Status filter
    it('should filter by Active status', () => {
        component.selectedStatus.set({ label: 'Active', value: 'Active' });
        expect(component.filteredRoundtables().length).toBe(2);
        expect(component.filteredRoundtables().every(r => r.status === 'Active')).toBe(true);
    });

    it('should filter by Inactive status', () => {
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        expect(component.filteredRoundtables().length).toBe(1);
        expect(component.filteredRoundtables()[0].name).toBe('Roundtable Beta');
    });

    it('should show all when status filter is "All"', () => {
        component.selectedStatus.set({ label: 'All', value: 'All' });
        expect(component.filteredRoundtables().length).toBe(3);
    });

    // 6. Search filtering
    it('should filter by name using searchText', () => {
        component.searchText.set('alpha');
        expect(component.filteredRoundtables().length).toBe(1);
        expect(component.filteredRoundtables()[0].name).toBe('Roundtable Alpha');
    });

    it('should filter by director using searchText', () => {
        component.searchText.set('Director B');
        expect(component.filteredRoundtables().length).toBe(1);
        expect(component.filteredRoundtables()[0].abbreviation).toBe('RB');
    });

    it('should filter by associate using searchText', () => {
        component.searchText.set('Associate C');
        expect(component.filteredRoundtables().length).toBe(1);
        expect(component.filteredRoundtables()[0].name).toBe('Roundtable Gamma');
    });

    it('should be case-insensitive in searchText', () => {
        component.searchText.set('GAMMA');
        expect(component.filteredRoundtables().length).toBe(1);
    });

    it('should return empty when searchText matches nothing', () => {
        component.searchText.set('XYZNoMatch');
        expect(component.filteredRoundtables().length).toBe(0);
    });

    it('should ignore whitespace-only searchText', () => {
        component.searchText.set('   ');
        expect(component.filteredRoundtables().length).toBe(3);
    });

    // 7. Combined filters
    it('should combine Active status and search text', () => {
        component.selectedStatus.set({ label: 'Active', value: 'Active' });
        component.searchText.set('Director A');
        expect(component.filteredRoundtables().length).toBe(2);
    });

    it('should combine Inactive status and search text to narrow to one result', () => {
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        component.searchText.set('Beta');
        expect(component.filteredRoundtables().length).toBe(1);
        expect(component.filteredRoundtables()[0].name).toBe('Roundtable Beta');
    });

    it('should return empty when status and name search conflict', () => {
        component.selectedStatus.set({ label: 'Inactive', value: 'Inactive' });
        component.searchText.set('Alpha');
        expect(component.filteredRoundtables().length).toBe(0);
    });

    // 8. editRoundtable() navigates with correct id
    it('should call editRoundtable() with the correct roundtable', () => {
        const spy = vi.spyOn(component, 'editRoundtable');
        component.editRoundtable(sampleRoundtables[0]);
        expect(spy).toHaveBeenCalledWith(sampleRoundtables[0]);
    });

    it('should navigate to edit route with roundtable id', () => {
        component.editRoundtable(sampleRoundtables[0]);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/roundtables/edit', 1]);
    });

    it('should navigate with the correct id for the second roundtable', () => {
        component.editRoundtable(sampleRoundtables[1]);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/roundtables/edit', 2]);
    });

    // 9. Filter options initialized correctly
    it('should initialize statusOptions with All, Active, Inactive', () => {
        const values = component.statusOptions.map(o => o.value);
        expect(values).toContain('All');
        expect(values).toContain('Active');
        expect(values).toContain('Inactive');
    });
});
