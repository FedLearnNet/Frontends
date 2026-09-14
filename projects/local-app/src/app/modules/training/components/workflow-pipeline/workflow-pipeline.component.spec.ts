import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPipelineComponent } from './workflow-pipeline.component';

describe('WorkflowPipelineComponent', () => {
  let component: WorkflowPipelineComponent;
  let fixture: ComponentFixture<WorkflowPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowPipelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
