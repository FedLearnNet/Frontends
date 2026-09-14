import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAnalysisResultAnalyzerDialogComponent } from './data-analysis-result-analyzer-dialog.component';

describe('DataAnalysisResultAnalyzerDialogComponent', () => {
  let component: DataAnalysisResultAnalyzerDialogComponent;
  let fixture: ComponentFixture<DataAnalysisResultAnalyzerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAnalysisResultAnalyzerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAnalysisResultAnalyzerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
