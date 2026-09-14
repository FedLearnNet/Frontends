import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowInputCardComponent } from './workflow-input-card.component';

describe('WorkflowNodeCardComponent', () => {
  let _component: WorkflowInputCardComponent;
  let fixture: ComponentFixture<WorkflowInputCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowInputCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowInputCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
