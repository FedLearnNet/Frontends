import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentsChartGenericEditComponent } from './experiments-chart-generic-edit.component';

describe('ExperimentsChartGenericEditComponent', () => {
  let component: ExperimentsChartGenericEditComponent;
  let fixture: ComponentFixture<ExperimentsChartGenericEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentsChartGenericEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentsChartGenericEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
