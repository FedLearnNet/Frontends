import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailPageComponent } from './workflow-detail-page.component';

describe('WorkflowDetailPageComponent', () => {
  let component: WorkflowDetailPageComponent;
  let fixture: ComponentFixture<WorkflowDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
