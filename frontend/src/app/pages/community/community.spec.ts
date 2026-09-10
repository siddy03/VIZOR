import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { CommunityComponent } from './community';
import { LayoutService } from '../../services/layout';
import { reducers, metaReducers } from '../../store/app.state';

describe('CommunityComponent', () => {
  let component: CommunityComponent;
  let fixture: ComponentFixture<CommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityComponent],
      providers: [
        LayoutService,
        provideStore(reducers, { metaReducers }),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
