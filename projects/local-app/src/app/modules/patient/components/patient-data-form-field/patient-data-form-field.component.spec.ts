import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataFormFieldComponent } from './patient-data-form-field.component';

describe('PatientDataFormFieldComponent', () => {
  let component: PatientDataFormFieldComponent;
  let fixture: ComponentFixture<PatientDataFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDataFormFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
