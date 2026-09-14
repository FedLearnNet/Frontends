import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPublishDialogComponent } from './workflow-publish-dialog.component';

describe('WorkflowPublishDialogComponent', () => {
  let component: WorkflowPublishDialogComponent;
  let fixture: ComponentFixture<WorkflowPublishDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowPublishDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowPublishDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
