import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowChatDialogComponent } from './workflow-chat-dialog.component';

describe('WorkflowChatDialogComponent', () => {
  let component: WorkflowChatDialogComponent;
  let fixture: ComponentFixture<WorkflowChatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowChatDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
