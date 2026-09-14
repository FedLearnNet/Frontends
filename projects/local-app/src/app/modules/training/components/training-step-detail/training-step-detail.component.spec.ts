import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingStepDetailComponent } from './training-step-detail.component';

describe('TrainingStepDetailComponent', () => {
  let component: TrainingStepDetailComponent;
  let fixture: ComponentFixture<TrainingStepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStepDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingStepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
