import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelWorkflowDetailComponent } from './model-workflow-detail.component';

describe('ModelWorkflowDetailComponent', () => {
  let component: ModelWorkflowDetailComponent;
  let fixture: ComponentFixture<ModelWorkflowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelWorkflowDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelWorkflowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
