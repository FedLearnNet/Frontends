import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TrainingComponent} from './training.component';

describe('AddDataComponent', () => {
  let component: TrainingComponent;
  let fixture: ComponentFixture<TrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TrainingComponent]
});
    fixture = TestBed.createComponent(TrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component);
  });
});
