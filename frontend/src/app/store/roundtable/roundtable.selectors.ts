import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoundtableState } from './roundtable.reducer';

export const selectRoundtableState = createFeatureSelector<RoundtableState>('roundtable');

export const selectAllRoundtables = createSelector(
    selectRoundtableState,
    (state) => state.roundtables
);

export const selectRoundtableById = (id: number) => createSelector(
    selectAllRoundtables,
    (roundtables) => roundtables.find(r => r.id === id)
);
