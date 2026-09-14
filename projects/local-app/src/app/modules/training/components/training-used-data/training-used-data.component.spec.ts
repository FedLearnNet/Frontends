import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingUsedDataComponent } from './training-used-data.component';

describe('FlProjectDetailComponent', () => {
  let _component: TrainingUsedDataComponent;
  let fixture: ComponentFixture<TrainingUsedDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingUsedDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingUsedDataComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
