import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectSidebarCollapsed } from '../store/layout/layout.selectors';
import * as LayoutActions from '../store/layout/layout.actions';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private store = inject(Store<AppState>);


    sidebarCollapsed = toSignal(this.store.select(selectSidebarCollapsed), { initialValue: false });


    mobileSidebarOpen = signal(false);

    pageTitleOverride = signal<string | null>(null);

    toggleSidebar() {

        if (window.innerWidth <= 768) {
            this.mobileSidebarOpen.update(v => !v);
        } else {
            this.store.dispatch(LayoutActions.toggleSidebar());
        }
    }

    setSidebarState(collapsed: boolean) 
    {
        this.store.dispatch(LayoutActions.setSidebarState({ collapsed }));
    }

    openMobileSidebar() {
        this.mobileSidebarOpen.set(true);
    }

    closeMobileSidebar() {
        this.mobileSidebarOpen.set(false);
    }
}
