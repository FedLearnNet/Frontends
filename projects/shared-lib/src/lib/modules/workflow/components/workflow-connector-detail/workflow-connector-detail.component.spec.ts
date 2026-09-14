import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowConnectorDetailComponent } from './workflow-connector-detail.component';

describe('WorkflowConnectorDetailComponent', () => {
  let component: WorkflowConnectorDetailComponent;
  let fixture: ComponentFixture<WorkflowConnectorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowConnectorDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowConnectorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
