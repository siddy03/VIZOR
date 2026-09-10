import { createAction, props } from '@ngrx/store';

export const toggleSidebar = createAction('[Layout] Toggle Sidebar');

export const setSidebarState = createAction(
    '[Layout] Set Sidebar State',
    props<{ collapsed: boolean }>()
);

export const setTitle = createAction(
    '[Layout] Set Title',
    props<{ title: string }>()
);
