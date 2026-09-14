import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateModelWorkflowDialogComponent } from './create-model-workflow-dialog.component';

describe('CreateModelWorkflowDialogComponent', () => {
  let component: CreateModelWorkflowDialogComponent;
  let fixture: ComponentFixture<CreateModelWorkflowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateModelWorkflowDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateModelWorkflowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
