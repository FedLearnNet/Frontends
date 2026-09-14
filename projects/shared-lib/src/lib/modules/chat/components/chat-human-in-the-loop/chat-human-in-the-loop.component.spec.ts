import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatHumanInTheLoopComponent } from './chat-human-in-the-loop.component';

describe('ChatHumanInTheLoopComponent', () => {
  let component: ChatHumanInTheLoopComponent;
  let fixture: ComponentFixture<ChatHumanInTheLoopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHumanInTheLoopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatHumanInTheLoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
