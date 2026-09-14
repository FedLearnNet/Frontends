import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageReasoningPanelComponent } from './chat-message-reasoning-panel.component';

describe('ChatMessageToolPanelComponent', () => {
  let component: ChatMessageReasoningPanelComponent;
  let fixture: ComponentFixture<ChatMessageReasoningPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageReasoningPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessageReasoningPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
