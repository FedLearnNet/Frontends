import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentStepDataComponent } from './experiment-step-data.component';

describe('ExperimentStepDataComponent', () => {
  let component: ExperimentStepDataComponent;
  let fixture: ComponentFixture<ExperimentStepDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentStepDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentStepDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
