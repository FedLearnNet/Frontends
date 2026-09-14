import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataElementComponent } from './patient-data-element.component';

describe('PatientDataElementComponent', () => {
  let component: PatientDataElementComponent;
  let fixture: ComponentFixture<PatientDataElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDataElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
