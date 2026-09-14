import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowViewComponent } from './workflow-view.component';

describe('WorkflowViewComponent', () => {
  let _component: WorkflowViewComponent;
  let fixture: ComponentFixture<WorkflowViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowViewComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
