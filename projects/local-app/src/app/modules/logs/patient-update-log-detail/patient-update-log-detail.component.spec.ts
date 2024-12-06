import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientUpdateLogDetailComponent } from './patient-update-log-detail.component';

describe('PatientUpdateLogDetailComponent', () => {
  let component: PatientUpdateLogDetailComponent;
  let fixture: ComponentFixture<PatientUpdateLogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientUpdateLogDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientUpdateLogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
