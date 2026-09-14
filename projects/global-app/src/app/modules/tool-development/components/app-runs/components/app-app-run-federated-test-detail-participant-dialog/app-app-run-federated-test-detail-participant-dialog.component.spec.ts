import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAppRunFederatedTestDetailParticipantDialogComponent } from './app-app-run-federated-test-detail-participant-dialog.component';

describe('AppAppRunFederatedTestDetailParticipantDialogComponent', () => {
  let component: AppAppRunFederatedTestDetailParticipantDialogComponent;
  let fixture: ComponentFixture<AppAppRunFederatedTestDetailParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAppRunFederatedTestDetailParticipantDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAppRunFederatedTestDetailParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
