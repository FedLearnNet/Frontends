import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentsChartGenericComponent } from './experiments-chart-generic.component';

describe('ExperimentsChartGenericComponent', () => {
  let component: ExperimentsChartGenericComponent;
  let fixture: ComponentFixture<ExperimentsChartGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentsChartGenericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentsChartGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
