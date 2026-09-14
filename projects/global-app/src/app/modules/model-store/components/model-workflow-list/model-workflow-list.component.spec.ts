import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelWorkflowListComponent } from './model-workflow-list.component';

describe('ModelWorkflowListComponent', () => {
  let component: ModelWorkflowListComponent;
  let fixture: ComponentFixture<ModelWorkflowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelWorkflowListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelWorkflowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
