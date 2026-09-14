import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataGroupComponent } from './patient-data-group.component';

describe('PatientDataGroupComponent', () => {
  let fixture: ComponentFixture<PatientDataGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDataGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataGroupComponent);
    fixture.detectChanges();
  });
});
