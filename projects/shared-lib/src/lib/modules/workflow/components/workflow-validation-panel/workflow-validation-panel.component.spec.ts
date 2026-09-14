import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowValidationPanelComponent } from './workflow-validation-panel.component';

describe('WorkflowValidationPanelComponent', () => {
  let component: WorkflowValidationPanelComponent;
  let fixture: ComponentFixture<WorkflowValidationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowValidationPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowValidationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
