import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowAppComponent } from './workflow-app.component';

describe('WorkflowAppComponent', () => {
  let component: WorkflowAppComponent;
  let fixture: ComponentFixture<WorkflowAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
