import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailQueryabilityFormComponent } from './patient-detail-queryability-form.component';

describe('PatientDetailQueryabilityFormComponent', () => {
  let component: PatientDetailQueryabilityFormComponent;
  let fixture: ComponentFixture<PatientDetailQueryabilityFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetailQueryabilityFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientDetailQueryabilityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
