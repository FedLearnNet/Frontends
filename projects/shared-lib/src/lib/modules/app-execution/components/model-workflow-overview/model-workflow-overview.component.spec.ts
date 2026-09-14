import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelWorkflowOverviewComponent } from './model-workflow-overview.component';

describe('ModelWorkflowOverviewComponent', () => {
  let component: ModelWorkflowOverviewComponent;
  let fixture: ComponentFixture<ModelWorkflowOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelWorkflowOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelWorkflowOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
