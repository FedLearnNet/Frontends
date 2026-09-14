import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLogQueryComponent } from './patient-log-query.component';

describe('PatientLogQueryComponent', () => {
  let component: PatientLogQueryComponent;
  let fixture: ComponentFixture<PatientLogQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientLogQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLogQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
