import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FederatedClientTypeBadgeComponent } from './federated-client-type-badge.component';
import { FLNetParticipantRole } from '../../../../../global-app/src/app/modules/tool-development/dto/federated-test-run';

describe('FederatedClientTypeBadgeComponent', () => {
  let component: FederatedClientTypeBadgeComponent;
  let fixture: ComponentFixture<FederatedClientTypeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FederatedClientTypeBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FederatedClientTypeBadgeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clientType', FLNetParticipantRole.CLIENT);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the participant name together with the type', () => {
    fixture.componentRef.setInput('clientName', 'client-1');
    fixture.detectChanges();

    const badgeElement: HTMLElement = fixture.nativeElement;

    expect(badgeElement.querySelector('.client-name')?.textContent?.trim()).toBe('client-1');
    expect(badgeElement.querySelector('.client-type')?.textContent?.trim()).toBe('Client');
  });
});
