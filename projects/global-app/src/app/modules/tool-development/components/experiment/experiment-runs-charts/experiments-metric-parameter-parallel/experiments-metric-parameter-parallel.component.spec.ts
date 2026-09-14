import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentsMetricParameterParallelComponent } from './experiments-metric-parameter-parallel.component';

describe('ExperimentsMetricParameterParallelComponent', () => {
  let component: ExperimentsMetricParameterParallelComponent;
  let fixture: ComponentFixture<ExperimentsMetricParameterParallelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentsMetricParameterParallelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentsMetricParameterParallelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
