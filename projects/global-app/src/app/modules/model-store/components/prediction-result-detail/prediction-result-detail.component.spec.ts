import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionResultDetailComponent } from './prediction-result-detail.component';

describe('PredictionResultDetailComponent', () => {
  let component: PredictionResultDetailComponent;
  let fixture: ComponentFixture<PredictionResultDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PredictionResultDetailComponent]
    });
    fixture = TestBed.createComponent(PredictionResultDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
