import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutService } from './layout';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from '../store/app.state';

describe('LayoutService (services/layout)', () => {
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

  it('should expose title as a signal', () => {
    expect(service.title).toBeDefined();
    expect(typeof service.title).toBe('function');
  });

  it('should emit new title when setTitle is called', () => {
    service.setTitle('Projects');
    expect(service.title()).toBe('Projects');
  });

  it('should default to "Home" as the initial title', () => {
    expect(service.title()).toBe('Home');
  });
});
