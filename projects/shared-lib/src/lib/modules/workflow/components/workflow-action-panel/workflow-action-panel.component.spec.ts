import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowActionPanelComponent } from './workflow-action-panel.component';

describe('WorkflowActionPanelComponent', () => {
  let _component: WorkflowActionPanelComponent;
  let fixture: ComponentFixture<WorkflowActionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowActionPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowActionPanelComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
