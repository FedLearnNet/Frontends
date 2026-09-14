import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowOverviewCardComponent } from './workflow-overview-card.component';

describe('WorkflowOverviewCardComponent', () => {
  let component: WorkflowOverviewCardComponent;
  let fixture: ComponentFixture<WorkflowOverviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowOverviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowOverviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
