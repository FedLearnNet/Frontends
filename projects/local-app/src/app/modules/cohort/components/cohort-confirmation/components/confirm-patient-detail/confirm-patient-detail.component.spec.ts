import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPatientDetailComponent } from './confirm-patient-detail.component';

describe('ConfirmPatientDetailComponent', () => {
  let component: ConfirmPatientDetailComponent;
  let fixture: ComponentFixture<ConfirmPatientDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmPatientDetailComponent]
    });
    fixture = TestBed.createComponent(ConfirmPatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
