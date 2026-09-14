import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentRunCircleComponent } from './experiment-run-circle.component';

describe('ExperimentRunCircleComponent', () => {
  let component: ExperimentRunCircleComponent;
  let fixture: ComponentFixture<ExperimentRunCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperimentRunCircleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentRunCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
