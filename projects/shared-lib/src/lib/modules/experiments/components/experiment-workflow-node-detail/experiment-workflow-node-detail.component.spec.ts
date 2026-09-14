import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkflowNodeDetailComponent } from './experiment-workflow-node-detail.component';

describe('ExperimentWorkflowNodeDetailComponent', () => {
  let component: ExperimentWorkflowNodeDetailComponent;
  let fixture: ComponentFixture<ExperimentWorkflowNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentWorkflowNodeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentWorkflowNodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
