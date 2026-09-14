import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataGroupDetailInfoDialogComponent } from './patient-data-group-detail-info-dialog.component';

describe('PatientDataGroupDetailInfoDialogComponent', () => {
  let component: PatientDataGroupDetailInfoDialogComponent;
  let fixture: ComponentFixture<PatientDataGroupDetailInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDataGroupDetailInfoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataGroupDetailInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
