import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentRunsChartsComponent } from './experiment-runs-charts.component';

describe('ExperimentRunsChartsComponent', () => {
  let component: ExperimentRunsChartsComponent;
  let fixture: ComponentFixture<ExperimentRunsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentRunsChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentRunsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
