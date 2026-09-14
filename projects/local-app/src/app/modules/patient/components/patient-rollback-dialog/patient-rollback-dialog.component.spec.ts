import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientRollbackDialogComponent } from './patient-rollback-dialog.component';

describe('PatientRollbackDialogComponent', () => {
  let component: PatientRollbackDialogComponent;
  let fixture: ComponentFixture<PatientRollbackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRollbackDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientRollbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
