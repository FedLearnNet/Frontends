import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLogTraceabilityComponent } from './patient-log-traceability.component';

describe('PatientLogTraceabilityComponent', () => {
  let component: PatientLogTraceabilityComponent;
  let fixture: ComponentFixture<PatientLogTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLogTraceabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLogTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
