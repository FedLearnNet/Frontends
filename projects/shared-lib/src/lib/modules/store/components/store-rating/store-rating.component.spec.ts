import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreRatingComponent } from './store-rating.component';

describe('StoreRatingComponent', () => {
  let component: StoreRatingComponent;
  let fixture: ComponentFixture<StoreRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreRatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
