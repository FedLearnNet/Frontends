import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageToolPanelComponent } from './chat-message-tool-panel.component';

describe('ChatMessageToolPanelComponent', () => {
  let component: ChatMessageToolPanelComponent;
  let fixture: ComponentFixture<ChatMessageToolPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageToolPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessageToolPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
