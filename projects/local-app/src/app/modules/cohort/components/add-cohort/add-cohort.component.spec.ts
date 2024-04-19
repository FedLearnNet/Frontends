import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCohortComponent } from './add-cohort.component';

describe('AddCohortComponent', () => {
  let component: AddCohortComponent;
  let fixture: ComponentFixture<AddCohortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCohortComponent]
    });
    fixture = TestBed.createComponent(AddCohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
