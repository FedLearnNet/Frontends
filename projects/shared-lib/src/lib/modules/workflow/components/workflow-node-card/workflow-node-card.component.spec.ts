import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNodeCardComponent } from './workflow-node-card.component';

describe('WorkflowNodeCardComponent', () => {
  let _component: WorkflowNodeCardComponent;
  let fixture: ComponentFixture<WorkflowNodeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowNodeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowNodeCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
