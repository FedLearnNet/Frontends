import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelWorkflowDetailComponent } from './model-workflow-detail.component';

describe('ModelWorkflowDetailComponent', () => {
  let _component: ModelWorkflowDetailComponent;
  let fixture: ComponentFixture<ModelWorkflowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelWorkflowDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelWorkflowDetailComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
