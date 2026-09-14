import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNodeDetailDialogComponent } from './workflow-node-detail-dialog.component';

describe('WorkflowNodeDetailDialogComponent', () => {
  let component: WorkflowNodeDetailDialogComponent;
  let fixture: ComponentFixture<WorkflowNodeDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowNodeDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowNodeDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
