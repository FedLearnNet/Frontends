import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTaskExecutionInfoDialogComponent } from './ai-task-execution-info-dialog.component';

describe('AiTaskExecutionInfoDialogComponent', () => {
  let component: AiTaskExecutionInfoDialogComponent;
  let fixture: ComponentFixture<AiTaskExecutionInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTaskExecutionInfoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTaskExecutionInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
