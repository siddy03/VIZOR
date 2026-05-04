// SETUP:
// - Configure testing module with:
//   - SidebarComponent in imports (standalone component)
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router with events subject and url property
// - Mock LayoutService with signal-based sidebarCollapsed and methods
// - Create component fixture and instance
// - Trigger change detection

// TESTS:
// 1. Component Creation
// 2. Renders sidebar container
// 3. menuItems array is defined and contains expected items
// 4. Home menu item has correct route
// 5. Admin menu item has sub-items (Users, Projects, Roundtables)
// 6. Surveys menu item has sub-items
// 7. isActive() returns true for matching route
// 8. isActive() returns false for non-matching route
// 9. navigate() calls router.navigate with the given path
// 10. navigate() collapses Surveys when navigating away
// 11. navigate() collapses Admin when navigating away
// 12. toggleSubmenu() expands if collapsed and sidebar is expanded
// 13. toggleSubmenu() collapses sidebar and opens submenu when sidebar is collapsed
// 14. toggleSidebar() calls layoutService.toggleSidebar()
// 15. ngOnDestroy() unsubscribes from router events
// 16. Hamburger button renders and calls toggleSidebar()
// 17. currentRoute initialized from router.url

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SidebarComponent } from './sidebar';
import { LayoutService } from '../layout.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let routerEventsSubject: Subject<any>;
  let isSidebarCollapsed: boolean;
  let mockLayoutService: {
    sidebarCollapsed: ReturnType<typeof vi.fn>;
    toggleSidebar: ReturnType<typeof vi.fn>;
    setSidebarState: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    isSidebarCollapsed = false;

    mockLayoutService = {
      sidebarCollapsed: vi.fn(() => isSidebarCollapsed),
      toggleSidebar: vi.fn(),
      setSidebarState: vi.fn()
    };

    const mockRouter = {
      events: routerEventsSubject.asObservable(),
      url: '/home',
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: LayoutService, useValue: mockLayoutService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 1. Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Renders sidebar container
  it('should render the sidebar container', () => {
    const container = fixture.debugElement.query(By.css('.sidebar-container'));
    expect(container).toBeTruthy();
  });

  it('should render the hamburger toggle button', () => {
    const hamburger = fixture.debugElement.query(By.css('.hamburger-btn-a11y'));
    expect(hamburger).toBeTruthy();
  });

  it('should call toggleSidebar() when hamburger button is clicked', () => {
    const spy = vi.spyOn(component, 'toggleSidebar');
    const hamburger = fixture.debugElement.query(By.css('.hamburger-btn-a11y'));
    hamburger.triggerEventHandler('click', {});
    expect(spy).toHaveBeenCalledOnce();
  });

  // 3. menuItems structure
  it('should have menuItems defined', () => {
    expect(component.menuItems).toBeDefined();
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('should have 8 top-level menu items', () => {
    expect(component.menuItems.length).toBe(8);
  });

  // 4. Home menu item
  it('should have a Home menu item with correct route', () => {
    const homeItem = component.menuItems.find(i => i.label === 'Home');
    expect(homeItem).toBeDefined();
    expect(homeItem!.route).toBe('/home');
  });

  // 5. Admin sub-items
  it('should have an Admin menu item with sub-items', () => {
    const adminItem = component.menuItems.find(i => i.label === 'Admin') as any;
    expect(adminItem).toBeDefined();
    expect(adminItem.items).toBeDefined();
    expect(adminItem.items.length).toBeGreaterThan(0);
  });

  it('should include Users, Projects, and Roundtables in Admin sub-items', () => {
    const adminItem = component.menuItems.find(i => i.label === 'Admin') as any;
    const labels = adminItem.items.map((i: any) => i.label);
    expect(labels).toContain('Users');
    expect(labels).toContain('Projects');
    expect(labels).toContain('Roundtables');
  });

  // 6. Surveys sub-items
  it('should have a Surveys menu item with sub-items', () => {
    const surveysItem = component.menuItems.find(i => i.label === 'Surveys') as any;
    expect(surveysItem).toBeDefined();
    expect(surveysItem.items).toBeDefined();
    expect(surveysItem.items.length).toBeGreaterThan(0);
  });

  // 7. isActive() returns true for matching route
  it('isActive() should return true for exact route match', () => {
    component.currentRoute = '/home';
    expect(component.isActive('/home')).toBe(true);
  });

  it('isActive() should return true when currentRoute starts with route + "/"', () => {
    component.currentRoute = '/admin/projects';
    expect(component.isActive('/admin')).toBe(true);
  });

  // 8. isActive() returns false for non-matching route
  it('isActive() should return false for non-matching route', () => {
    component.currentRoute = '/home';
    expect(component.isActive('/admin')).toBe(false);
  });

  // 9. navigate() calls router.navigate
  it('navigate() should call router.navigate with the given path', () => {
    const mockRouter = TestBed.inject(Router) as any;
    component.navigate('/admin/projects');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/projects']);
  });

  // 10. navigate() collapses Surveys when navigating away
  it('navigate() should collapse Surveys submenu when navigating to non-survey route', () => {
    (component.menuItems[1] as any).expanded = true;
    component.navigate('/home');
    expect((component.menuItems[1] as any).expanded).toBe(false);
  });

  it('navigate() should NOT collapse Surveys submenu when navigating to a survey route', () => {
    (component.menuItems[1] as any).expanded = true;
    component.navigate('/surveys/view');
    expect((component.menuItems[1] as any).expanded).toBe(true);
  });

  // 11. navigate() collapses Admin when navigating away
  it('navigate() should collapse Admin submenu when navigating to non-admin route', () => {
    (component.menuItems[5] as any).expanded = true;
    component.navigate('/home');
    expect((component.menuItems[5] as any).expanded).toBe(false);
  });

  it('navigate() should NOT collapse Admin submenu when navigating to admin route', () => {
    (component.menuItems[5] as any).expanded = true;
    component.navigate('/admin/projects');
    expect((component.menuItems[5] as any).expanded).toBe(true);
  });

  // 12. toggleSubmenu() expands item when sidebar is expanded
  it('toggleSubmenu() should toggle expanded state when sidebar is not collapsed', () => {
    isSidebarCollapsed = false;
    const item = { expanded: false };
    component.toggleSubmenu(item);
    expect(item.expanded).toBe(true);
  });

  it('toggleSubmenu() should collapse item if already expanded when sidebar is not collapsed', () => {
    isSidebarCollapsed = false;
    const item = { expanded: true };
    component.toggleSubmenu(item);
    expect(item.expanded).toBe(false);
  });

  // 13. toggleSubmenu() expands sidebar if it is collapsed
  it('toggleSubmenu() should call setSidebarState(false) and set item.expanded = true when sidebar is collapsed', () => {
    isSidebarCollapsed = true;
    const item = { expanded: false };
    component.toggleSubmenu(item);
    expect(mockLayoutService.setSidebarState).toHaveBeenCalledWith(false);
    expect(item.expanded).toBe(true);
  });

  // 14. toggleSidebar() calls layoutService.toggleSidebar()
  it('toggleSidebar() should call layoutService.toggleSidebar()', () => {
    component.toggleSidebar();
    expect(mockLayoutService.toggleSidebar).toHaveBeenCalledOnce();
  });

  // 15. ngOnDestroy() unsubscribes
  it('ngOnDestroy() should not throw errors', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  // 16. currentRoute initialized from router.url
  it('should initialize currentRoute from router.url', () => {
    expect(component.currentRoute).toBe('/home');
  });

  // 17. currentRoute updated on NavigationEnd
  it('should update currentRoute on NavigationEnd event', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/admin/projects', '/admin/projects'));
    expect(component.currentRoute).toBe('/admin/projects');
  });

  it('should update currentRoute on subsequent NavigationEnd events', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/surveys/view', '/surveys/view'));
    expect(component.currentRoute).toBe('/surveys/view');
    routerEventsSubject.next(new NavigationEnd(2, '/home', '/home'));
    expect(component.currentRoute).toBe('/home');
  });
});
