import { createReducer, on } from '@ngrx/store';
import * as LayoutActions from './layout.actions';

export interface LayoutState {
    sidebarCollapsed: boolean;
    title: string;
}

export const initialState: LayoutState = {
    sidebarCollapsed: false,
    title: 'Home'
};

export const layoutReducer = createReducer(
    initialState,

    on(LayoutActions.toggleSidebar, (state) => ({
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
    })),

    on(LayoutActions.setSidebarState, (state, { collapsed }) => ({
        ...state,
        sidebarCollapsed: collapsed
    })),

    on(LayoutActions.setTitle, (state, { title }) => ({
        ...state,
        title
    }))
);
