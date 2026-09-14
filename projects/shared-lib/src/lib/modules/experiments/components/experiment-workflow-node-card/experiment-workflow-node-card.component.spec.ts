import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkflowNodeCardComponent } from './experiment-workflow-node-card.component';

describe('ExperimentWorkflowNodeCardComponent', () => {
  let _component: ExperimentWorkflowNodeCardComponent;
  let fixture: ComponentFixture<ExperimentWorkflowNodeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentWorkflowNodeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentWorkflowNodeCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
