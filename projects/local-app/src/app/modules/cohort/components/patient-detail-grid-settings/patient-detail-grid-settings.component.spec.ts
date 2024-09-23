import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailGridSettingsComponent } from './patient-detail-grid-settings.component';

describe('PatientDetailGridSettingsComponent', () => {
  let component: PatientDetailGridSettingsComponent;
  let fixture: ComponentFixture<PatientDetailGridSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetailGridSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientDetailGridSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
