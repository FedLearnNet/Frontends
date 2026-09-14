import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowReadonlyViewComponent } from './workflow-readonly-view.component';

describe('ExperimentWorkflowViewComponent', () => {
  let component: WorkflowReadonlyViewComponent;
  let fixture: ComponentFixture<WorkflowReadonlyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowReadonlyViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowReadonlyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
