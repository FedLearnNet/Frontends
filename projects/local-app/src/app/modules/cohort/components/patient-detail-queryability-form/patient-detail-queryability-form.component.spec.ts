import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PatientDetailQueryabilityFormComponent} from './patient-detail-queryability-form.component';

describe('PatientDetailQueryabilityFormComponent', () => {
  let fixture: ComponentFixture<PatientDetailQueryabilityFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetailQueryabilityFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PatientDetailQueryabilityFormComponent);
    fixture.detectChanges();
  });
});
