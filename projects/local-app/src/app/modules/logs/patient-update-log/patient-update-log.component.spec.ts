import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientUpdateLogComponent } from './patient-update-log.component';

describe('PatientUpdateLogComponent', () => {
  let component: PatientUpdateLogComponent;
  let fixture: ComponentFixture<PatientUpdateLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientUpdateLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientUpdateLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
