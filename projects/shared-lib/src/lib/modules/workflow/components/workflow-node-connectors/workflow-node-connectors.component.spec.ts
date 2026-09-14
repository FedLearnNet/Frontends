import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNodeConnectorsComponent } from './workflow-node-connectors.component';

describe('WorkflowNodeOutputsComponent', () => {
  let _component: WorkflowNodeConnectorsComponent;
  let fixture: ComponentFixture<WorkflowNodeConnectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowNodeConnectorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowNodeConnectorsComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  })
});
