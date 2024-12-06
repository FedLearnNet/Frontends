import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionNewComponent } from './prediction-new.component';

describe('PredictionNewComponent', () => {
  let component: PredictionNewComponent;
  let fixture: ComponentFixture<PredictionNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictionNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
