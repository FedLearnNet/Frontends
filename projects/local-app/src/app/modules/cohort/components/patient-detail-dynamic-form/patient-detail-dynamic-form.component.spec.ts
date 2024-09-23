import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailDynamicFormComponent } from './patient-detail-dynamic-form.component';

describe('PatientDetailDynamicFormComponent', () => {
  let component: PatientDetailDynamicFormComponent;
  let fixture: ComponentFixture<PatientDetailDynamicFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDetailDynamicFormComponent]
    });
    fixture = TestBed.createComponent(PatientDetailDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
