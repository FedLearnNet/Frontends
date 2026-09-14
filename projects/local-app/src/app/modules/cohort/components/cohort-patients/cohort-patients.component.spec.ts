import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortPatientsComponent } from './cohort-patients.component';

describe('CohortPatientsComponent', () => {
  let component: CohortPatientsComponent;
  let fixture: ComponentFixture<CohortPatientsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [CohortPatientsComponent]
});
    fixture = TestBed.createComponent(CohortPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component);
  });
});
