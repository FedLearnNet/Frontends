import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQueryLogComponent } from './patient-query-log.component';

describe('PatientQueryLogComponent', () => {
  let component: PatientQueryLogComponent;
  let fixture: ComponentFixture<PatientQueryLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientQueryLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientQueryLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
