import { createReducer, on } from '@ngrx/store';
import { Roundtable } from '../../services/roundtable.service';
import * as RoundtableActions from './roundtable.actions';

export interface RoundtableState {
    roundtables: Roundtable[];
}

function loadFromLocalStorage(): Roundtable[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem('vizor_roundtables');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing roundtables from localStorage', e);
        }
    }
    return [];
}

export const initialState: RoundtableState = {
    roundtables: loadFromLocalStorage()
};

export const roundtableReducer = createReducer(
    initialState,

    on(RoundtableActions.loadRoundtables, (state, { roundtables }) => ({
        ...state,
        roundtables
    })),

    on(RoundtableActions.addRoundtable, (state, { roundtable }) => {
        const current = state.roundtables;
        const newId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1;
        const newRoundtable = { ...roundtable, id: newId };
        return {
            ...state,
            roundtables: [...current, newRoundtable]
        };
    }),

    on(RoundtableActions.updateRoundtable, (state, { roundtable }) => {
        const index = state.roundtables.findIndex(r => r.id === roundtable.id);
        if (index === -1) return state;
        const updated = [...state.roundtables];
        updated[index] = roundtable;
        return {
            ...state,
            roundtables: updated
        };
    })
);
