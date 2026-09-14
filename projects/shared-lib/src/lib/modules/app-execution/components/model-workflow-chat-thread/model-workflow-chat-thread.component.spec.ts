import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelWorkflowChatThreadComponent } from './model-workflow-chat-thread.component';

describe('ModelWorkflowChatThreadComponent', () => {
  let _component: ModelWorkflowChatThreadComponent;
  let fixture: ComponentFixture<ModelWorkflowChatThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelWorkflowChatThreadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelWorkflowChatThreadComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
