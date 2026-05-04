import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutState } from './layout.reducer';

export const selectLayoutState = createFeatureSelector<LayoutState>('layout');

export const selectSidebarCollapsed = createSelector(
    selectLayoutState,
    (state) => state.sidebarCollapsed
);

export const selectTitle = createSelector(
    selectLayoutState,
    (state) => state.title
);
