import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalysisWorkflowDetailDialogComponent } from './data-analysis-workflow-detail-dialog.component';

describe('DataAnalysisWorkflowDetailDialogComponent', () => {
  let component: DataAnalysisWorkflowDetailDialogComponent;
  let fixture: ComponentFixture<DataAnalysisWorkflowDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAnalysisWorkflowDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAnalysisWorkflowDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
