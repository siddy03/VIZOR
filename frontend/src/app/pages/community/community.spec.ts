import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CommunityComponent } from './community';
import { LayoutService } from '../../services/layout';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from '../../store/app.state';

describe('CommunityComponent', () => {
  let component: CommunityComponent;
  let fixture: ComponentFixture<CommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityComponent],
      providers: [LayoutService, provideStore(reducers, { metaReducers })]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have activeTab default to "discussion"', () => {
    expect(component.activeTab).toBe('discussion');
  });

  it('setActiveTab should update the activeTab', () => {
    component.setActiveTab('events');
    expect(component.activeTab).toBe('events');
  });
});
