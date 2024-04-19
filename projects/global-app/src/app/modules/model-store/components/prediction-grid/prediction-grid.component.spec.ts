import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionGridComponent } from './prediction-grid.component';

describe('PredictionGridComponent', () => {
  let component: PredictionGridComponent;
  let fixture: ComponentFixture<PredictionGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PredictionGridComponent]
    });
    fixture = TestBed.createComponent(PredictionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
