import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowChatComponent } from './workflow-chat.component';

describe('WorkflowChatComponent', () => {
  let component: WorkflowChatComponent;
  let fixture: ComponentFixture<WorkflowChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
