import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectAllRoundtables, selectRoundtableById } from '../store/roundtable/roundtable.selectors';
import * as RoundtableActions from '../store/roundtable/roundtable.actions';
import { firstValueFrom } from 'rxjs';

export interface Roundtable {
    id: number;
    name: string;
    abbreviation: string;
    clientsWithAccess: number; // For now derived from selectedClients.length
    directors: string; // Comma separated list
    associates: string; // Comma separated list
    description: string;
    status: string; // 'Active' or 'Inactive'

    // Storing raw selection data for editing purposes later if needed
    clientIds?: any[];
    directorIds?: any[];
    associateIds?: any[];
    primaryDirector?: any;
    primaryAssociate?: any;
}

@Injectable({
    providedIn: 'root'
})
export class RoundtableService {
    private store = inject(Store<AppState>);
    private http = inject(HttpClient);

    // Keep the readonly observable accessor via NgRx select
    readonly roundtables$ = this.store.select(selectAllRoundtables);

    /** Fetch all roundtables from backend and sync to NgRx store */
    async loadRoundtables(): Promise<void> {
        try {
            const roundtables = await firstValueFrom(
                this.http.get<Roundtable[]>('/api/roundtables')
            );
            this.store.dispatch(RoundtableActions.loadRoundtables({ roundtables }));
        } catch (error) {
            console.error('Failed to load roundtables from API', error);
        }
    }

    getRoundtables(): Roundtable[] {
        let roundtables: Roundtable[] = [];
        // Synchronous read from store
        this.store.select(selectAllRoundtables).subscribe(r => roundtables = r).unsubscribe();
        return roundtables;
    }

    async addRoundtable(roundtable: Roundtable): Promise<void> {
        try {
            const created = await firstValueFrom(
                this.http.post<Roundtable>('/api/roundtables', roundtable)
            );
            this.store.dispatch(RoundtableActions.addRoundtable({ roundtable: created }));
        } catch (error) {
            console.error('Failed to add roundtable', error);
            // Fallback: still dispatch to local store
            this.store.dispatch(RoundtableActions.addRoundtable({ roundtable }));
        }
    }

    getRoundtableById(id: number): Roundtable | undefined {
        let roundtable: Roundtable | undefined;
        this.store.select(selectRoundtableById(id)).subscribe(r => roundtable = r).unsubscribe();
        return roundtable;
    }

    async updateRoundtable(updatedRoundtable: Roundtable): Promise<void> {
        try {
            const saved = await firstValueFrom(
                this.http.put<Roundtable>(`/api/roundtables/${updatedRoundtable.id}`, updatedRoundtable)
            );
            this.store.dispatch(RoundtableActions.updateRoundtable({ roundtable: saved }));
        } catch (error) {
            console.error('Failed to update roundtable', error);
            // Fallback: still dispatch to local store
            this.store.dispatch(RoundtableActions.updateRoundtable({ roundtable: updatedRoundtable }));
        }
    }
}
