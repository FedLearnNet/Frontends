import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentsMetricParameterHeatmapComponent } from './experiments-metric-parameter-heatmap.component';

describe('ExperimentsMetricParameterHeatmapComponent', () => {
  let component: ExperimentsMetricParameterHeatmapComponent;
  let fixture: ComponentFixture<ExperimentsMetricParameterHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentsMetricParameterHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentsMetricParameterHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
