import { TestBed } from '@angular/core/testing';
import { RoundtableService, Roundtable } from './roundtable.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { provideStore, Store } from '@ngrx/store';
import { reducers, metaReducers } from '../store/app.state';
import * as RoundtableActions from '../store/roundtable/roundtable.actions';

describe('RoundtableService', () => {
    let service: RoundtableService;

    const mockRoundtable: Roundtable = {
        id: 0,
        name: 'Test Roundtable',
        abbreviation: 'TR',
        clientsWithAccess: 2,
        directors: 'Director A, Director B',
        associates: 'Associate A',
        description: 'A test roundtable',
        status: 'Active'
    };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideStore(reducers, { metaReducers })
            ]
        });
        service = TestBed.inject(RoundtableService);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with an empty list when localStorage is empty', () => {
        const roundtables = service.getRoundtables();
        expect(roundtables.length).toBe(0);
    });

    it('should add a new roundtable with auto-incremented id starting at 1', () => {
        service.addRoundtable({ ...mockRoundtable });
        const roundtables = service.getRoundtables();
        expect(roundtables.length).toBe(1);
        expect(roundtables[0].id).toBe(1);
    });

    it('should correctly increment id for subsequent roundtables', () => {
        service.addRoundtable({ ...mockRoundtable });
        service.addRoundtable({ ...mockRoundtable, name: 'Second Roundtable' });
        const roundtables = service.getRoundtables();
        expect(roundtables[1].id).toBe(2);
    });

    it('should return a roundtable by its id', () => {
        service.addRoundtable({ ...mockRoundtable });
        const found = service.getRoundtableById(1);
        expect(found).toBeDefined();
        expect(found?.name).toBe('Test Roundtable');
    });

    it('should return undefined for a non-existent id', () => {
        const found = service.getRoundtableById(999);
        expect(found).toBeUndefined();
    });

    it('should update an existing roundtable', () => {
        service.addRoundtable({ ...mockRoundtable });
        const updated: Roundtable = { ...mockRoundtable, id: 1, name: 'Updated Roundtable' };
        service.updateRoundtable(updated);
        const roundtables = service.getRoundtables();
        expect(roundtables[0].name).toBe('Updated Roundtable');
    });

    it('should not change the list when updating a non-existent id', () => {
        service.addRoundtable({ ...mockRoundtable });
        service.updateRoundtable({ ...mockRoundtable, id: 999, name: 'Ghost' });
        const roundtables = service.getRoundtables();
        expect(roundtables.length).toBe(1);
        expect(roundtables[0].name).toBe('Test Roundtable');
    });

    it('should persist roundtables to localStorage on add', () => {
        service.addRoundtable({ ...mockRoundtable });
        const stored = JSON.parse(localStorage.getItem('vizor_roundtables') || '[]');
        expect(stored.length).toBe(1);
        expect(stored[0].name).toBe('Test Roundtable');
    });

    it('should persist roundtables to localStorage on update', () => {
        service.addRoundtable({ ...mockRoundtable });
        service.updateRoundtable({ ...mockRoundtable, id: 1, name: 'Updated Name' });
        const stored = JSON.parse(localStorage.getItem('vizor_roundtables') || '[]');
        expect(stored[0].name).toBe('Updated Name');
    });

    it('should load roundtables from localStorage on construction', () => {
        const storedData: Roundtable[] = [{ ...mockRoundtable, id: 7, name: 'Stored Roundtable' }];
        const store = TestBed.inject(Store);
        store.dispatch(RoundtableActions.loadRoundtables({ roundtables: storedData }));

        const result = service.getRoundtables();
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Stored Roundtable');
    });

    it('should handle corrupted localStorage gracefully', () => {
        localStorage.setItem('vizor_roundtables', '{bad json}');
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                provideStore(reducers, { metaReducers })
            ]
        });
        const freshService = TestBed.inject(RoundtableService);
        const result = freshService.getRoundtables();
        expect(result.length).toBe(0);
    });

    it('should expose getRoundtables() returning an array', () => {
        const result = service.getRoundtables();
        expect(Array.isArray(result)).toBe(true);
    });
});
