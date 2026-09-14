import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTaskExecutionComponent } from './ai-task-execution.component';

describe('AiTaskExecutionComponent', () => {
  let _component: AiTaskExecutionComponent;
  let fixture: ComponentFixture<AiTaskExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTaskExecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTaskExecutionComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
