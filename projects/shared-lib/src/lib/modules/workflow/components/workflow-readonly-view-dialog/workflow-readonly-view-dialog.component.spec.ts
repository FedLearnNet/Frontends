import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowReadonlyViewDialogComponent } from './workflow-readonly-view-dialog.component';

describe('WorkflowReadonlyViewDialogComponent', () => {
  let component: WorkflowReadonlyViewDialogComponent;
  let fixture: ComponentFixture<WorkflowReadonlyViewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowReadonlyViewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowReadonlyViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
