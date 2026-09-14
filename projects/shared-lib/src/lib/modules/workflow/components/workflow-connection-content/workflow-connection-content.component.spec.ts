import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowConnectionContentComponent } from './workflow-connection-content.component';

describe('WorkflowConnectionsComponent', () => {
  let component: WorkflowConnectionContentComponent;
  let fixture: ComponentFixture<WorkflowConnectionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowConnectionContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowConnectionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
