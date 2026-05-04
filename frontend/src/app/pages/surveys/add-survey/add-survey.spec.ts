import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSurvey } from './add-survey';

describe('AddSurvey', () => {
  let component: AddSurvey;
  let fixture: ComponentFixture<AddSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSurvey]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
