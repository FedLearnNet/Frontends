import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQueryLogDetailComponent } from './patient-query-log-detail.component';

describe('PatientQueryLogDetailComponent', () => {
  let component: PatientQueryLogDetailComponent;
  let fixture: ComponentFixture<PatientQueryLogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientQueryLogDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientQueryLogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
