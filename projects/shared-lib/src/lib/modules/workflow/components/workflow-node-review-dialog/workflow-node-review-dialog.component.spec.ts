import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNodeReviewDialogComponent } from './workflow-node-review-dialog.component';

describe('WorkflowNodeReviewDialogComponent', () => {
  let component: WorkflowNodeReviewDialogComponent;
  let fixture: ComponentFixture<WorkflowNodeReviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowNodeReviewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowNodeReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
