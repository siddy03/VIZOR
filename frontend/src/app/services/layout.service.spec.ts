import { TestBed } from '@angular/core/testing';
import { LayoutService } from '../layout/layout.service';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from '../store/app.state';

describe('LayoutService', () => {
    let service: LayoutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideStore(reducers, { metaReducers })
            ]
        });
        service = TestBed.inject(LayoutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have sidebarCollapsed default to false (expanded)', () => {
        expect(service.sidebarCollapsed()).toBe(false);
    });

    it('should toggle sidebarCollapsed from false to true', () => {
        service.toggleSidebar();
        expect(service.sidebarCollapsed()).toBe(true);
    });

    it('should toggle sidebarCollapsed back to false on second toggle', () => {
        service.toggleSidebar();
        service.toggleSidebar();
        expect(service.sidebarCollapsed()).toBe(false);
    });

    it('should set sidebarCollapsed to true using setSidebarState', () => {
        service.setSidebarState(true);
        expect(service.sidebarCollapsed()).toBe(true);
    });

    it('should set sidebarCollapsed to false using setSidebarState', () => {
        service.setSidebarState(true);
        service.setSidebarState(false);
        expect(service.sidebarCollapsed()).toBe(false);
    });
});
