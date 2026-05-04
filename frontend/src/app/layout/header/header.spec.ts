// SETUP:
// - Configure testing module with:
//   - HeaderComponent in imports (standalone component)
//   - NO_ERRORS_SCHEMA to ignore unknown PrimeNG elements
// - Mock Router with events subject and routerState
// - Create component fixture and instance
// - Trigger change detection

// TESTS:
// 1. Component Creation
// 2. Renders page title element
// 3. Default page title is "Home"
// 4. Renders user name display
// 5. userMenuItems includes Profile, Settings, Logout
// 6. userMenuItems has a separator
// 7. Page title updates on NavigationEnd event

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerEventsSubject: Subject<any>;

  const makeRouterState = (title: string) => ({
    root: {
      snapshot: { data: { title } },
      firstChild: null
    }
  });

  beforeEach(async () => {
    routerEventsSubject = new Subject();

    const mockRouter = {
      events: routerEventsSubject.asObservable(),
      routerState: makeRouterState('Home')
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 1. Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Renders page title element
  it('should render the page title element', () => {
    const titleEl = fixture.debugElement.query(By.css('.page-title'));
    expect(titleEl).toBeTruthy();
  });

  // 3. Default page title is "Home"
  it('should display "Home" as the default page title', () => {
    const titleEl = fixture.debugElement.query(By.css('.page-title'));
    expect(titleEl.nativeElement.textContent.trim()).toBe('Home');
  });

  it('should set pageTitle to "Home" on init when no route data title', () => {
    expect(component.pageTitle).toBe('Home');
  });

  // 4. Renders user name display
  it('should render the user name display', () => {
    const userName = fixture.debugElement.query(By.css('.user-name'));
    expect(userName).toBeTruthy();
    expect(userName.nativeElement.textContent).toContain('Admin user');
  });

  // 5. userMenuItems includes Profile, Settings, Logout
  it('should have a Profile menu item', () => {
    const profileItem = component.userMenuItems.find(item => item.label === 'Profile');
    expect(profileItem).toBeTruthy();
    expect(profileItem!.icon).toBe('pi pi-user');
  });

  it('should have a Settings menu item', () => {
    const settingsItem = component.userMenuItems.find(item => item.label === 'Settings');
    expect(settingsItem).toBeTruthy();
    expect(settingsItem!.icon).toBe('pi pi-cog');
  });

  it('should have a Logout menu item', () => {
    const logoutItem = component.userMenuItems.find(item => item.label === 'Logout');
    expect(logoutItem).toBeTruthy();
    expect(logoutItem!.icon).toBe('pi pi-sign-out');
  });

  it('should have exactly 4 user menu items', () => {
    expect(component.userMenuItems.length).toBe(4);
  });

  // 6. userMenuItems has a separator
  it('should have a separator in userMenuItems', () => {
    const separator = component.userMenuItems.find(item => item.separator === true);
    expect(separator).toBeTruthy();
  });

  // 7. Page title updates on NavigationEnd event
  it('should update pageTitle when a NavigationEnd event fires', () => {
    const mockRouter = TestBed.inject(Router) as any;
    mockRouter.routerState = makeRouterState('Projects');
    routerEventsSubject.next(new NavigationEnd(1, '/admin/projects', '/admin/projects'));
    expect(component.pageTitle).toBe('Projects');
  });

  it('should fall back to "Home" when route data has no title', () => {
    const mockRouter = TestBed.inject(Router) as any;
    mockRouter.routerState = { root: { snapshot: { data: {} }, firstChild: null } };
    routerEventsSubject.next(new NavigationEnd(2, '/unknown', '/unknown'));
    expect(component.pageTitle).toBe('Home');
  });

  // Header actions section
  it('should render the header container', () => {
    const container = fixture.debugElement.query(By.css('.header-container'));
    expect(container).toBeTruthy();
  });

  it('should render the search input in the header', () => {
    const searchInput = fixture.debugElement.query(By.css('.search-input-field'));
    expect(searchInput).toBeTruthy();
  });

  it('should render the user section', () => {
    const userSection = fixture.debugElement.query(By.css('.user-section'));
    expect(userSection).toBeTruthy();
  });
});
