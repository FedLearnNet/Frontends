import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalExperimentStepDetailComponent } from './local-experiment-step-detail.component';

describe('LocalExperimentStepDetailComponent', () => {
  let component: LocalExperimentStepDetailComponent;
  let fixture: ComponentFixture<LocalExperimentStepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalExperimentStepDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalExperimentStepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
