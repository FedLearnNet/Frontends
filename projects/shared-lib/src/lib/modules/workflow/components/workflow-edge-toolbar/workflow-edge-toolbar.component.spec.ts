import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowEdgeToolbarComponent } from './workflow-edge-toolbar.component';

describe('WorkflowEdgeToolbarComponent', () => {
  let component: WorkflowEdgeToolbarComponent;
  let fixture: ComponentFixture<WorkflowEdgeToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowEdgeToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowEdgeToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
