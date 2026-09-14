import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PatientDetailComponent} from './patient-detail.component';

describe('PatientDetailComponent', () => {
  let fixture: ComponentFixture<PatientDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetailComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PatientDetailComponent);
    fixture.detectChanges();
  });

});
