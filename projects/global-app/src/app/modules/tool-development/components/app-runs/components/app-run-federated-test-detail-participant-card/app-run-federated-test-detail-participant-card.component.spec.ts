import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunFederatedTestDetailParticipantCardComponent } from './app-run-federated-test-detail-participant-card.component';

describe('AppRunFederatedTestDetailParticipantCardComponent', () => {
  let component: AppRunFederatedTestDetailParticipantCardComponent;
  let fixture: ComponentFixture<AppRunFederatedTestDetailParticipantCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunFederatedTestDetailParticipantCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunFederatedTestDetailParticipantCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
