import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataSparklineComponent } from './patient-data-sparkline.component';

describe('PatientDataSparklineComponent', () => {
  let component: PatientDataSparklineComponent;
  let fixture: ComponentFixture<PatientDataSparklineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDataSparklineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataSparklineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
