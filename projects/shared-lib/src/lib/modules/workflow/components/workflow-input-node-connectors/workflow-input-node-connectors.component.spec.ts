import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowInputNodeConnectorsComponent } from './workflow-input-node-connectors.component';

describe('WorkflowNodeOutputsComponent', () => {
  let _component: WorkflowInputNodeConnectorsComponent;
  let fixture: ComponentFixture<WorkflowInputNodeConnectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowInputNodeConnectorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowInputNodeConnectorsComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  })
});
