import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLearningLogComponent } from './patient-learning-log.component';

describe('PatientLearningLogComponent', () => {
  let component: PatientLearningLogComponent;
  let fixture: ComponentFixture<PatientLearningLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLearningLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLearningLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component);
  });
});
