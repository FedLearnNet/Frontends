import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLogTrainingComponent } from './patient-log-training.component';

describe('PatientLogTrainingComponent', () => {
  let component: PatientLogTrainingComponent;
  let fixture: ComponentFixture<PatientLogTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLogTrainingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLogTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
